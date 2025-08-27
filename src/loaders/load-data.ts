import { readFile } from 'fs/promises';
import { neo4jService } from '../services/neo4j.services.ts';
import type { DataSourceJson, ClienteRaw, InteraccionRaw } from '../types/index.js';
import { randomUUID } from 'crypto';

interface LoadStats {
  clientesCargados: number;
  interaccionesCargadas: number;
  pagosCargados: number;
  promesasCargadas: number;
  agentesCargados: number;
  deudasCargadas: number;
  errores: string[];
}



export class DataLoader {
  private stats: LoadStats = {
    clientesCargados: 0,
    interaccionesCargadas: 0,
    pagosCargados: 0,
    promesasCargadas: 0,
    agentesCargados: 0,
    deudasCargadas: 0,
    errores: []
  };

  async loadData(jsonFilePath: string = './data/interacciones_clientes.json'): Promise<LoadStats> {
    console.log('🚀 Iniciando carga de datos...');

    try {
      // Verificar conexión
      const connected = await neo4jService.testConnection();
      if (!connected) {
        throw new Error('No se pudo conectar a Neo4j');
      }

      console.log('📖 Leyendo archivo JSON...');
      const jsonData = await this.readJsonFile(jsonFilePath);

      await this.clearDatabase();

      await this.createConstraints();

      await this.loadClientes(jsonData.clientes);
      await this.loadAgentes(jsonData.interacciones);
      await this.loadInteracciones(jsonData.interacciones);

      console.log('✅ Carga de datos completada');

      return this.stats;

    } catch (error) {
      console.error('❌ Error en carga de datos:', error);
      this.stats.errores.push(`Error general: ${error}`);
      throw error;
    }
  }

  private async readJsonFile(filePath: string): Promise<DataSourceJson> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as DataSourceJson;

      console.log(`📊 JSON cargado: ${data.clientes.length} clientes, ${data.interacciones.length} interacciones`);
      return data;
    } catch (error) {
      throw new Error(`Error leyendo archivo JSON: ${error}`);
    }
  }

  private async clearDatabase(): Promise<void> {
    console.log('🧹 Limpiando base de datos...');

    const queries = [
      'MATCH (n) DETACH DELETE n',
      'CALL apoc.schema.assert({}, {})'  // Eliminar constraints si APOC está disponible
    ];

    for (const query of queries) {
      try {
        await neo4jService.runQuery(query);
      } catch (error) {
        // Ignorar errores de APOC si no está disponible
        if (!query.includes('apoc')) {
          console.warn(`Advertencia ejecutando: ${query}`, error);
        }
      }
    }
  }

  private async createConstraints(): Promise<void> {
    console.log('🔧 Creando constraints e índices...');

    // const constraints = [
    //   // Constraints únicos
    //   'CREATE CONSTRAINT cliente_id IF NOT EXISTS FOR (c:Cliente) REQUIRE c.id IS UNIQUE',
    //   'CREATE CONSTRAINT agente_id IF NOT EXISTS FOR (a:Agente) REQUIRE a.id IS UNIQUE',
    //   'CREATE CONSTRAINT deuda_id IF NOT EXISTS FOR (d:Deuda) REQUIRE d.id IS UNIQUE',
    //   'CREATE CONSTRAINT interaccion_id IF NOT EXISTS FOR (i:Interaccion) REQUIRE i.id IS UNIQUE',
    //   'CREATE CONSTRAINT pago_id IF NOT EXISTS FOR (p:Pago) REQUIRE p.id IS UNIQUE',
    //   'CREATE CONSTRAINT promesa_id IF NOT EXISTS FOR (pr:PromesaDePago) REQUIRE pr.id IS UNIQUE',

    //   // Índices para búsquedas
    //   'CREATE INDEX cliente_nombre IF NOT EXISTS FOR (c:Cliente) ON (c.nombre)',
    //   'CREATE INDEX interaccion_timestamp IF NOT EXISTS FOR (i:Interaccion) ON (i.timestamp)',
    //   'CREATE INDEX pago_fecha IF NOT EXISTS FOR (p:Pago) ON (p.fecha)',
    //   'CREATE INDEX promesa_fecha_vencimiento IF NOT EXISTS FOR (pr:PromesaDePago) ON (pr.fecha_vencimiento)'
    // ];

    // for (const constraint of constraints) {
    //   try {
    //     await neo4jService.runQuery(constraint);
    //   } catch (error) {
    //     // Los constraints pueden fallar si ya existen
    //     console.warn(`Advertencia creando constraint: ${constraint}`);
    //   }
    // }
  }

  private async loadClientes(clientes: ClienteRaw[]): Promise<void> {
    console.log('👥 Cargando clientes...');

    for (const cliente of clientes) {
      try {
        // Crear nodo Cliente
        await neo4jService.runQuery(`
          CREATE (c:Cliente {
            id: $id,
            nombre: $nombre,
            telefono: $telefono,
            fecha_ultimo_contacto: null,
            created_at: datetime(),
            updated_at: datetime()
          })
        `, {
          id: cliente.id,
          nombre: cliente.nombre,
          telefono: cliente.telefono
        });

        ///Crear nodo Deuda asociado
        const deudaId = `deuda_${cliente.id}`;
        await neo4jService.runQuery(`
          MATCH (c:Cliente {id: $clienteId})
          CREATE (d:Deuda {
            id: $deudaId,
            cliente_id: $clienteId,
            monto_original: $montoOriginal,
            monto_actual: $montoOriginal,
            tipo_deuda: $tipoDeuda,
            fecha_creacion: $fechaCreacion,
            estado: 'pendiente',
            created_at: datetime(),
            updated_at: datetime()
          })
          MERGE (c)-[:TIENE_DEUDA]->(d)
        `, {
          clienteId: cliente.id,
          deudaId,
          montoOriginal: cliente.monto_deuda_inicial,
          tipoDeuda: cliente.tipo_deuda,
          fechaCreacion: cliente.fecha_prestamo
        });

        this.stats.clientesCargados++;
        this.stats.deudasCargadas++;

      } catch (error) {
        this.stats.errores.push(`Error cargando cliente ${cliente.id}: ${error}`);
      }
    }
  }

  private async loadAgentes(interacciones: InteraccionRaw[]): Promise<void> {
    console.log('👨‍💼 Cargando agentes...');
    // Extraer agentes únicos de las interacciones
    const agentesUnicos = new Set<string>();
    interacciones.forEach(int => {
      if (int.agente_id && int.agente_id.trim()) {
        agentesUnicos.add(int.agente_id);
      }
    });

    for (const agenteId of agentesUnicos) {
      try {
        const nameAgente = `name_${agenteId}`;
        await neo4jService.runQuery(`
          MERGE (a:Agente {
            id: $agenteId,
            nombre: $nombre,
            departamento: 'Cobranzas',
            total_interacciones: 0,
            promesas_cumplidas: 0,
            promesas_totales: 0,
            tasa_efectividad: 0.0,
            created_at: datetime(),
            updated_at: datetime()
          })
        `, {
          agenteId,
          nombre: nameAgente
        });

        this.stats.agentesCargados++;
      } catch (error) {
        this.stats.errores.push(`Error cargando agente ${agenteId}: ${error}`);
      }
    }
  }

  private async loadInteracciones(interacciones: InteraccionRaw[]): Promise<void> {
    console.log('💬 Cargando interacciones (método simple)...');

    // Obtenemos una sesión del driver de Neo4j
    const session = neo4jService.getSession();

    try {
      for (let i = 0; i < interacciones.length; i++) {
        const interaccion = interacciones[i];

        try {
          const agenteId = interaccion.agente_id ?? null; // Si es nulo, usamos una cadena vacía
          const resultado = interaccion.resultado ?? null; // Si es nulo, usamos 'desconocido'
          const sentimiento = interaccion.sentimiento ?? null;
          // executeWrite asegura que todas las operaciones dentro de esta función
          // se ejecuten en una única transacción.
          await session.executeWrite(async tx => {
            // 1. Crear el nodo de Interacción y conectarlo con el Cliente
            await tx.run(`
                        MATCH (c:Cliente {id: $clienteId})
                        CREATE (i:Interaccion {
                            id: $id,
                            cliente_id: $clienteId,
                            agente_id: $agenteId,
                            timestamp: datetime($timestamp),
                            tipo_contacto: $tipo,
                            resultado: $resultado,
                            sentimiento: $sentimiento,
                            duracion_segundos: $duracion,
                            created_at: datetime()
                        })
                        CREATE (c)-[:PARTICIPA_EN]->(i)
                    `, {
              id: interaccion.id,
              clienteId: interaccion.cliente_id,
              agenteId: agenteId,
              resultado: resultado,
              sentimiento: sentimiento,
              timestamp: interaccion.timestamp,
              tipo: interaccion.tipo,
              duracion: interaccion.duracion_segundos || 0
            });

            // 2. Conectar con el Agente si existe
            if (interaccion.agente_id) {
              await tx.run(`
                            MATCH (i:Interaccion {id: $interaccionId})
                            MATCH (a:Agente {id: $agenteId})
                            CREATE (i)-[:REALIZADA_POR]->(a)
                        `, {
                interaccionId: interaccion.id,
                agenteId: interaccion.agente_id
              });
            }

            // 3. Crear nodo de Pago si corresponde
            if (interaccion.tipo === 'pago_recibido' && interaccion.monto) {
              await tx.run(`
                            MATCH (i:Interaccion {id: $interaccionId})
                            CREATE (p:Pago {
                                id: $id,
                                monto: $monto,
                                metodo: $metodo,
                                pago_completo: $esCompleto,
                                fecha: date(i.timestamp)
                            })
                            CREATE (i)-[:GENERO_PAGO]->(p)
                        `, {
                id: randomUUID(),
                interaccionId: interaccion.id,
                monto: interaccion.monto,
                metodo: interaccion.metodo_pago,
                esCompleto: interaccion.pago_completo
              });
            }

            // 4. Crear nodo de Promesa de Pago si corresponde
            if (interaccion.resultado === 'promesa_pago' && interaccion.monto_prometido && interaccion.fecha_promesa) {
              await tx.run(`
                            MATCH (i:Interaccion {id: $interaccionId})
                            CREATE (pp:PromesaDePago {
                                id: $id,
                                monto: $montoPrometido,
                                fecha_promesa: date($fechaPromesa),
                            })
                            CREATE (i)-[:GENERO_PROMESA]->(pp)
                        `, {
                id: randomUUID(),
                interaccionId: interaccion.id,
                montoPrometido: interaccion.monto_prometido,
                fechaPromesa: interaccion.fecha_promesa
              });
            }

            if (interaccion.resultado === "renegociacion" && interaccion.nuevo_plan_pago?.cuotas && interaccion.nuevo_plan_pago?.monto_mensual) {
              await tx.run(`
                            MATCH (i:Interaccion {id: $interaccionId})
                            CREATE (re:Renegociacion {
                                id: $id,
                                cuotas: $cuotas,
                                monto_mensual: $montoMensual
                            })
                            CREATE (i)-[:GENERO_RENEGOCIACION]->(re)
                        `, {
                id: randomUUID(),
                interaccionId: interaccion.id,
                cuotas: interaccion.nuevo_plan_pago.cuotas,
                montoMensual: interaccion.nuevo_plan_pago.monto_mensual
              });
            }
          });



          this.stats.interaccionesCargadas++;

          // Progreso cada 50 interacciones
          if ((i + 1) % 50 === 0) {
            console.log(`   📊 Procesadas ${i + 1}/${interacciones.length} interacciones`);
          }

        } catch (error) {
          console.log(error)
          this.stats.errores.push(`Error en transacción para interacción ${interaccion.id}: ${error}`);
        }
      }
    } finally {
      await session.close();
    }

  }

}