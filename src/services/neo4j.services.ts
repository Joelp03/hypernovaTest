import neo4j, { Driver, Session, Record } from "neo4j-driver";

export class Neo4jService {
  private driver: Driver;
  private static instance: Neo4jService;

  private constructor() {
    const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password123';

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  public static getInstance(): Neo4jService {
    if (!Neo4jService.instance) {
      Neo4jService.instance = new Neo4jService();
    }
    return Neo4jService.instance;
  }

  public async testConnection(): Promise<boolean> {
    const session = this.driver.session();
    try {
      await session.run('RETURN 1');
      console.log('✅ Neo4j conectado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error conectando a Neo4j:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  public getSession(): Session {
    return this.driver.session();
  }

  public async runQuery(query: string, parameters: any = {}): Promise<Record[]> {
    const session = this.getSession();
    try {
      const result = await session.run(query, parameters);
      return result.records;
    } finally {
      await session.close();
    }
  }

  public async runTransaction(queries: Array<{ query: string; params?: any }>): Promise<void> {
    const session = this.getSession();
    const tx = session.beginTransaction();
    
    try {
      for (const { query, params = {} } of queries) {
        await tx.run(query, params);
      }
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      await session.close();
    }
  }

  // ===== QUERIES ESPECÍFICOS DEL DOMINIO =====

  // Obtener todos los clientes
  async getClientes(limite: number = 50): Promise<any[]> {
    const query = `
      MATCH (c:Cliente)
      OPTIONAL MATCH (c)-[:TIENE_DEUDA]->(d:Deuda)
      OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(i:Interaccion)
      WITH c, 
           sum(d.monto_actual) as total_deuda,
           max(i.timestamp) as ultima_interaccion
      RETURN c.id as id,
             c.nombre as nombre, 
             c.telefono as telefono,
             c.estado_cuenta as estado_cuenta,
             coalesce(total_deuda, 0) as total_deuda_actual,
             ultima_interaccion as fecha_ultimo_contacto
      ORDER BY c.nombre
      LIMIT $limite
    `;
    
    const records = await this.runQuery(query, { limite });
    return records.map(record => ({
      id: record.get('id'),
      nombre: record.get('nombre'),
      telefono: record.get('telefono'),
      estado_cuenta: record.get('estado_cuenta'),
      total_deuda_actual: record.get('total_deuda_actual'),
      fecha_ultimo_contacto: record.get('fecha_ultimo_contacto')
    }));
  }

  // Obtener cliente específico
  async getCliente(clienteId: string): Promise<any | null> {
    const query = `
      MATCH (c:Cliente {id: $clienteId})
      OPTIONAL MATCH (c)-[:TIENE_DEUDA]->(d:Deuda)
      WITH c, sum(d.monto_actual) as total_deuda
      RETURN c.id as id,
             c.nombre as nombre,
             c.telefono as telefono,
             c.email as email,
             c.estado_cuenta as estado_cuenta,
             coalesce(total_deuda, 0) as total_deuda_actual,
             c.fecha_ultimo_contacto as fecha_ultimo_contacto,
             c.created_at as created_at,
             c.updated_at as updated_at
    `;
    
    const records = await this.runQuery(query, { clienteId });
    if (records.length === 0) return null;
    
    const record = records[0];
    return {
      id: record.get('id'),
      nombre: record.get('nombre'),
      telefono: record.get('telefono'),
      email: record.get('email'),
      estado_cuenta: record.get('estado_cuenta'),
      total_deuda_actual: record.get('total_deuda_actual'),
      fecha_ultimo_contacto: record.get('fecha_ultimo_contacto'),
      created_at: record.get('created_at'),
      updated_at: record.get('updated_at')
    };
  }

  // Timeline de cliente
  async getClienteTimeline(clienteId: string, filtros: any = {}): Promise<any> {
    // Obtener cliente y deuda
    const cliente = await this.getCliente(clienteId);
    if (!cliente) return null;

    // Obtener deuda actual
    const deudaQuery = `
      MATCH (c:Cliente {id: $clienteId})-[:TIENE_DEUDA]->(d:Deuda)
      RETURN d.id as id, d.monto_original necesito crear un services que guarde una data .json en neo4j ts. el archivo json tiene esta estructura: 
{
  "metadata": {
    "fecha_generacion": string,    // ISO timestamp
    "total_clientes": number,
    "total_interacciones": number,
    "periodo": string
  },
  "clientes": [
    {
      "id": string,                 // formato: "cliente_XXX"
      "nombre": string,
      "telefono": string,
      "monto_deuda_inicial": number,
      "fecha_prestamo": string,     // formato: "YYYY-MM-DD"
      "tipo_deuda": string           // valores: "tarjeta_credito" | "prestamo_personal" | "hipoteca" | "auto"
    }
  ],
  "interacciones": [
    {
      "id": string,                  // UUID corto
      "cliente_id": string,
      "timestamp": string,           // ISO timestamp con Z
      "tipo": string,                // valores: "llamada_saliente" | "llamada_entrante" | "email" | "sms" | "pago_recibido"
      
      // Campos condicionales según tipo:
      
      // Si tipo es llamada_*:
      "duracion_segundos"?: number,
      "agente_id"?: string,
      "resultado"?: string,          // valores: "promesa_pago" | "sin_respuesta" | "renegociacion" | "disputa" | "pago_inmediato" | "se_niega_pagar"
      "sentimiento"?: string,        // valores: "cooperativo" | "neutral" | "frustrado" | "hostil" | "n/a"
      
      // Si resultado es "promesa_pago":
      "monto_prometido"?: number,
      "fecha_promesa"?: string,
      
      // Si resultado es "renegociacion":
      "nuevo_plan_pago"?: {
        "cuotas": number,
        "monto_mensual": number
      },
      
      // Si tipo es "pago_recibido":
      "monto"?: number,
      "metodo_pago"?: string,        // valores: "transferencia" | "tarjeta" | "efectivo"
      "pago_completo"?: boolean
    }
  ]
}as monto_original, 
             d.monto_actual as monto_actual, d.tipo_deuda as tipo_deuda,
             d.fecha_creacion as fecha_creacion, d.estado as estado
      ORDER BY d.fecha_creacion DESC
      LIMIT 1
    `;
    
    const deudaRecords = await this.runQuery(deudaQuery, { clienteId });
    const deuda = deudaRecords.length > 0 ? {
      id: deudaRecords[0].get('id'),
      cliente_id: clienteId,
      monto_original: deudaRecords[0].get('monto_original'),
      monto_actual: deudaRecords[0].get('monto_actual'),
      tipo_deuda: deudaRecords[0].get('tipo_deuda'),
      fecha_creacion: deudaRecords[0].get('fecha_creacion'),
      estado: deudaRecords[0].get('estado'),
      created_at: deudaRecords[0].get('fecha_creacion'),
      updated_at: new Date().toISOString()
    } : null;

    // Obtener eventos del timeline
    const eventosQuery = `
      MATCH (c:Cliente {id: $clienteId})
      OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(i:Interaccion)
      OPTIONAL MATCH (i)-[:REALIZADA_POR]->(a:Agente)
      OPTIONAL MATCH (c)-[:REALIZA]->(p:Pago)
      OPTIONAL MATCH (i)-[:GENERA_PROMESA]->(pr:Promesa)
      
      WITH i, a, p, pr
      WHERE i IS NOT NULL OR p IS NOT NULL
      
      // Eventos de interacción
      UNWIND CASE WHEN i IS NOT NULL THEN [{
        id: i.id,
        tipo: 'interaccion',
        fecha: i.timestamp,
        titulo: CASE i.tipo_contacto
          WHEN 'llamada_saliente' THEN 'Llamada saliente'
          WHEN 'llamada_entrante' THEN 'Llamada entrante'  
          WHEN 'email' THEN 'Email enviado'
          WHEN 'sms' THEN 'SMS enviado'
          ELSE i.tipo_contacto
        END,
        descripcion: coalesce(i.resultado, 'Sin resultado'),
        agente: a.nombre,
        estado: i.resultado,
        detalles: {
          duracion: i.duracion_segundos,
          sentimiento: i.sentimiento,
          resultado: i.resultado,
          monto_prometido: pr.monto_prometido
        }
      }] ELSE [] END AS eventos
      
      UNION
      
      // Eventos de pago
      UNWIND CASE WHEN p IS NOT NULL THEN [{
        id: p.id,
        tipo: 'pago',
        fecha: p.fecha,
        titulo: 'Pago recibido',
        descripcion: p.metodo_pago,
        monto: p.monto,
        estado: p.estado,
        detalles: {
          metodo_pago: p.metodo_pago,
          pago_completo: p.pago_completo
        }
      }] ELSE [] END AS eventos
      
      RETURN eventos
      ORDER BY eventos.fecha DESC
      LIMIT $limite
    `;
    
    const eventosRecords = await this.runQuery(eventosQuery, { 
      clienteId, 
      limite: filtros.limite || 50 
    });
    
    const eventos = eventosRecords.flatMap(record => record.get('eventos'));

    return {
      cliente,
      deuda_actual: deuda,
      eventos,
      total_eventos: eventos.length,
      periodo: {
        inicio: filtros.fechaInicio || '2024-01-01',
        fin: filtros.fechaFin || new Date().toISOString().split('T')[0]
      }
    };
  }

  // Obtener agentes
  async getAgentes(): Promise<any[]> {
    const query = `
      MATCH (a:Agente)
      OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(i:Interaccion)
      OPTIONAL MATCH (i)-[:GENERA_PROMESA]->(p:Promesa)
      OPTIONAL MATCH (p)-[:CUMPLIDA_CON]->(pago:Pago)
      
      WITH a, 
           count(DISTINCT i) as total_interacciones,
           count(DISTINCT p) as promesas_totales,
           count(DISTINCT pago) as promesas_cumplidas
      
      RETURN a.id as id,
             a.nombre as nombre,
             a.departamento as departamento,
             total_interacciones,
             promesas_cumplidas,
             promesas_totales,
             CASE WHEN promesas_totales > 0 
               THEN round(promesas_cumplidas * 100.0 / promesas_totales, 1)
               ELSE 0 
             END as tasa_efectividad
      ORDER BY tasa_efectividad DESC
    `;
    
    const records = await this.runQuery(query);
    return records.map(record => ({
      id: record.get('id'),
      nombre: record.get('nombre'),
      departamento: record.get('departamento'),
      total_interacciones: record.get('total_interacciones'),
      promesas_cumplidas: record.get('promesas_cumplidas'),
      promesas_totales: record.get('promesas_totales'),
      tasa_efectividad: record.get('tasa_efectividad')
    }));
  }

  // Efectividad de agente
  async getAgenteEfectividad(agenteId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
    const agente = await this.runQuery(`
      MATCH (a:Agente {id: $agenteId}) 
      RETURN a
    `, { agenteId });
    
    if (agente.length === 0) return null;

    const metricas = await this.runQuery(`
      MATCH (a:Agente {id: $agenteId})<-[:REALIZADA_POR]-(i:Interaccion)
      OPTIONAL MATCH (i)-[:GENERA_PROMESA]->(p:Promesa)
      OPTIONAL MATCH (p)-[:CUMPLIDA_CON]->(pago:Pago)
      OPTIONAL MATCH (i)-[:GENERA_PAGO]->(pago_directo:Pago)
      
      WITH i, p, pago, pago_directo
      
      RETURN count(DISTINCT i) as total_interacciones,
             count(DISTINCT p) as promesas_generadas,
             count(DISTINCT pago) as promesas_cumplidas,
             sum(coalesce(pago.monto, 0) + coalesce(pago_directo.monto, 0)) as monto_recuperado,
             avg(i.duracion_segundos) as tiempo_promedio_llamada
    `, { agenteId });

    return {
      agente: agente[0].get('a').properties,
      metricas: metricas[0] ? {
        total_interacciones: metricas[0].get('total_interacciones'),
        promesas_generadas: metricas[0].get('promesas_generadas'),
        promesas_cumplidas: metricas[0].get('promesas_cumplidas'),
        tasa_cumplimiento: metricas[0].get('promesas_generadas') > 0 
          ? (metricas[0].get('promesas_cumplidas') / metricas[0].get('promesas_generadas')) * 100 
          : 0,
        monto_recuperado: metricas[0].get('monto_recuperado'),
        tiempo_promedio_llamada: metricas[0].get('tiempo_promedio_llamada'),
        distribución_sentimientos: {},
        mejores_horarios: []
      } : null
    };
  }

  // KPIs generales
  async getKPIs(): Promise<any> {
    const query = `
      // Tasa de recuperación
      MATCH (d:Deuda)
      WITH sum(d.monto_original - d.monto_actual) as total_recuperado,
           sum(d.monto_original) as total_original
      
      // Promesas cumplidas
      MATCH (p:Promesa)
      WITH total_recuperado, total_original,
           count(p) as total_promesas,
           sum(CASE WHEN p.cumplida THEN 1 ELSE 0 END) as promesas_cumplidas
      
      // Clientes activos
      MATCH (c:Cliente)
      WHERE c.estado_cuenta IN ['activo', 'moroso']
      WITH total_recuperado, total_original, promesas_cumplidas,
           count(c) as clientes_activos
      
      // Interacciones último mes  
      MATCH (i:Interaccion)
      WHERE i.timestamp >= date() - duration({days: 30})
      WITH total_recuperado, total_original, promesas_cumplidas, clientes_activos,
           count(i) as interacciones_mes
      
      RETURN round(total_recuperado * 100.0 / total_original, 1) as tasa_recuperacion,
             promesas_cumplidas,
             total_recuperado as monto_total_recuperado,
             clientes_activos,
             interacciones_mes as interacciones_ultimo_mes
    `;

    const records = await this.runQuery(query);
    if (records.length === 0) {
      return {
        tasa_recuperacion: 0,
        promesas_cumplidas: 0,
        monto_total_recuperado: 0,
        clientes_activos: 0,
        interacciones_ultimo_mes: 0,
        tiempo_promedio_resolucion: 0,
        distribucion_tipos_deuda: {},
        evolucion_mensual: []
      };
    }

    const record = records[0];
    return {
      tasa_recuperacion: record.get('tasa_recuperacion'),
      promesas_cumplidas: record.get('promesas_cumplidas'),
      monto_total_recuperado: record.get('monto_total_recuperado'),
      clientes_activos: record.get('clientes_activos'),
      interacciones_ultimo_mes: record.get('interacciones_ultimo_mes'),
      tiempo_promedio_resolucion: 12, // TODO: calcular real
      distribucion_tipos_deuda: {}, // TODO: consulta separada
      evolucion_mensual: [] // TODO: consulta separada
    };
  }

  // Promesas incumplidas
  async getPromesasIncumplidas(limite: number = 50): Promise<any[]> {
    const query = `
      MATCH (p:Promesa)
      WHERE NOT p.cumplida AND p.fecha_vencimiento < date()
      
      MATCH (p)<-[:GENERA_PROMESA]-(i:Interaccion)
      MATCH (i)<-[:PARTICIPA_EN]-(c:Cliente)
      OPTIONAL MATCH (i)-[:REALIZADA_POR]->(a:Agente)
      
      WITH p, i, c, a,
           duration.between(date(p.fecha_vencimiento), date()).days as dias_vencida
      
      RETURN p as promesa, 
             i as interaccion,
             c as cliente, 
             a as agente,
             dias_vencida,
             p.monto_prometido as monto_pendiente
      ORDER BY dias_vencida DESC
      LIMIT $limite
    `;
    
    const records = await this.runQuery(query, { limite });
    return records.map(record => ({
      promesa: record.get('promesa').properties,
      interaccion: record.get('interaccion').properties, 
      cliente: record.get('cliente').properties,
      agente: record.get('agente') ? record.get('agente').properties : null,
      dias_vencida: record.get('dias_vencida'),
      monto_pendiente: record.get('monto_pendiente')
    }));
  }

  public async close(): Promise<void> {
    await this.driver.close();
  }
}

export const neo4jService = Neo4jService.getInstance();