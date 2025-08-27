import { ClienteRaw, ClienteTimeline, TimelineEvent } from "@/types";
import { neo4jService } from "./neo4j.services";


export class ClientServices {
    private readonly neo4jClient = neo4jService
    public async getClients(limite: number = 50): Promise<ClienteRaw[]> {

        const query = `
          MATCH (c:Cliente)-[:TIENE_DEUDA]->(d:Deuda)
          RETURN 
            c.id as id, 
            c.nombre as nombre,  
            c.telefono as telefono,
            d.monto_original as monto_deuda_inicial,
            d.fecha_creacion as fecha_prestamo,
            d.tipo_deuda as tipo_deuda
          ORDER BY c.nombre
          `;

        try {
            const records = await this.neo4jClient.runQuery(query);

            return records.map(record => {
                const tipoDeuda = record.get('tipo_deuda');

                const tiposPermitidos: Array<ClienteRaw['tipo_deuda']> = [
                    'tarjeta_credito',
                    'prestamo_personal',
                    'hipoteca',
                    'auto'
                ];

                const tipoDeudaValidado = tiposPermitidos.includes(tipoDeuda)
                    ? tipoDeuda
                    : 'prestamo_personal'; // Valor por defecto si no coincide

                return {
                    id: record.get('id') || '',
                    nombre: record.get('nombre') || '',
                    telefono: record.get('telefono') || '',
                    monto_deuda_inicial: Number(record.get('monto_deuda_inicial')) || 0,
                    fecha_prestamo: record.get('fecha_prestamo') || '',
                    tipo_deuda: tipoDeudaValidado
                };
            });
        } catch (error) {
            console.error("Error obteniendo clientes:", error);
            throw error;
        }
    }

     /**
   * Obtiene el timeline completo de un cliente específico
   */
  async getClienteTimeline(
    clienteId: string, 
    filtros: {
      fechaInicio?: string;
      fechaFin?: string;
      tiposInteraccion?: string[];
      agentes?: string[];
      includePagos?: boolean;
      includePromesas?: boolean;
      limite?: number;
    } = {}
  ): Promise<ClienteTimeline | null> {
    
    // 1. Obtener información del cliente
    const cliente = await this.getClienteInfo(clienteId);
    if (!cliente) return null;

    // 2. Obtener deuda actual
    const deuda = await this.getClienteDeuda(clienteId);

    // 3. Obtener eventos del timeline
    const eventos = await this.getTimelineEvents(clienteId, filtros);

    return {
      cliente,
      deuda_actual: deuda!!,
      eventos,
      total_eventos: eventos.length,
      periodo: {
        inicio: filtros.fechaInicio || '2024-01-01',
        fin: filtros.fechaFin || new Date().toISOString().split('T')[0]
      }
    };
  }

  /**
   * Obtiene información básica del cliente
   */
  private async getClienteInfo(clienteId: string) {
    const query = `
      MATCH (c:Cliente {id: $clienteId})
      OPTIONAL MATCH (c)-[:TIENE_DEUDA]->(d:Deuda)
      OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(i:Interaccion)
      
      WITH c, 
           sum(d.monto_actual) as total_deuda,
           max(i.timestamp) as ultima_interaccion
      
      RETURN c.id as id,
             c.nombre as nombre,
             c.telefono as telefono,
             c.email as email,
             c.estado_cuenta as estado_cuenta,
             coalesce(total_deuda, 0) as total_deuda_actual,
             toString(ultima_interaccion) as fecha_ultimo_contacto,
             toString(c.created_at) as created_at,
             toString(c.updated_at) as updated_at
    `;

    const records = await this.neo4jClient.runQuery(query, { clienteId });
    if (records.length === 0) return null;

    const record = records[0];
    const fecha_ultimo_contacto = record.get('fecha_ultimo_contacto')
    console.log("wiippp", fecha_ultimo_contacto)
    return {
      id: record.get('id'),
      nombre: record.get('nombre'),
      telefono: record.get('telefono'),
      email: record.get('email'),
      estado_cuenta: record.get('estado_cuenta'),
      total_deuda_actual: record.get('total_deuda_actual'),
      fecha_ultimo_contacto: fecha_ultimo_contacto,
      created_at: record.get('created_at'),
      updated_at: record.get('updated_at')
    };
  }

  /**
   * Obtiene la deuda actual del cliente
   */
  private async getClienteDeuda(clienteId: string) {
    const query = `
      MATCH (c:Cliente {id: $clienteId})-[:TIENE_DEUDA]->(d:Deuda)
      RETURN d.id as id,
             d.cliente_id as cliente_id,
             d.monto_original as monto_original,
             d.monto_actual as monto_actual,
             d.tipo_deuda as tipo_deuda,
             d.fecha_creacion as fecha_creacion,
             d.fecha_vencimiento as fecha_vencimiento,
             d.estado as estado,
             toString(d.created_at) as created_at,
             toString(d.updated_at) as updated_at
      ORDER BY d.created_at DESC
      LIMIT 1
    `;

    const records = await this.neo4jClient.runQuery(query, { clienteId });
    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.get('id'),
      cliente_id: record.get('cliente_id'),
      monto_original: record.get('monto_original'),
      monto_actual: record.get('monto_actual'),
      tipo_deuda: record.get('tipo_deuda'),
      fecha_creacion: record.get('fecha_creacion'),
      fecha_vencimiento: record.get('fecha_vencimiento'),
      estado: record.get('estado'),
      created_at: record.get('created_at'),
      updated_at: record.get('updated_at')
    };
  }

  /**
   * Obtiene todos los eventos del timeline (interacciones, pagos, promesas)
   */
  private async getTimelineEvents(
    clienteId: string, 
    filtros: any = {}
  ): Promise<TimelineEvent[]> {
    
    const whereConditions: string[] = [];
    const parameters: any = { clienteId };

    // Construir filtros dinámicos
    if (filtros.fechaInicio) {
      whereConditions.push('evento.timestamp >= datetime($fechaInicio)');
      parameters.fechaInicio = `${filtros.fechaInicio}T00:00:00Z`;
    }

    if (filtros.fechaFin) {
      whereConditions.push('evento.timestamp <= datetime($fechaFin)');
      parameters.fechaFin = `${filtros.fechaFin}T23:59:59Z`;
    }

    if (filtros.tiposInteraccion && filtros.tiposInteraccion.length > 0) {
      whereConditions.push('(evento.tipo_contacto IN $tiposInteraccion OR evento_tipo = "pago" OR evento_tipo = "promesa")');
      parameters.tiposInteraccion = filtros.tiposInteraccion;
    }

    if (filtros.agentes && filtros.agentes.length > 0) {
      whereConditions.push('agente.id IN $agentes');
      parameters.agentes = filtros.agentes;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const limite = filtros.limite || 50;
    parameters.limite = limite;

    const query = `
      MATCH (c:Cliente {id: $clienteId})
      
      // Obtener interacciones
      OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(i:Interaccion)
      OPTIONAL MATCH (i)-[:REALIZADA_POR]->(a_int:Agente)
      OPTIONAL MATCH (i)-[:GENERA_PROMESA]->(pr:Promesa)
      
      WITH c, i, a_int, pr,
           CASE 
             WHEN i IS NOT NULL THEN {
               id: i.id,
               tipo: 'interaccion',
               timestamp: i.timestamp,
               titulo: CASE i.tipo_contacto
                 WHEN 'llamada_saliente' THEN 'Llamada saliente'
                 WHEN 'llamada_entrante' THEN 'Llamada entrante'
                 WHEN 'email' THEN 'Email enviado'
                 WHEN 'sms' THEN 'SMS enviado'
                 ELSE i.tipo_contacto
               END,
               descripcion: CASE 
                 WHEN i.resultado IS NOT NULL THEN i.resultado
                 ELSE 'Contacto realizado'
               END,
               agente: a_int.nombre,
               monto: pr.monto_prometido,
               estado: i.resultado,
               detalles: {
                 duracion: i.duracion_segundos,
                 sentimiento: i.sentimiento,
                 resultado: i.resultado,
                 monto_prometido: pr.monto_prometido,
                 tipo_contacto: i.tipo_contacto
               },
               evento_tipo: 'interaccion',
               tipo_contacto: i.tipo_contacto
             }
             ELSE null
           END as evento_interaccion,
           a_int as agente
      
      // Obtener pagos
      OPTIONAL MATCH (c)-[:REALIZA]->(p:Pago)
      OPTIONAL MATCH (p)<-[:GENERA_PAGO]-(i_pago:Interaccion)
      OPTIONAL MATCH (i_pago)-[:REALIZADA_POR]->(a_pago:Agente)
      
      WITH c, evento_interaccion, agente,
           CASE 
             WHEN p IS NOT NULL THEN {
               id: p.id,
               tipo: 'pago',
               timestamp: datetime(p.fecha + 'T12:00:00Z'),
               titulo: 'Pago recibido',
               descripcion: CASE p.metodo_pago
                 WHEN 'transferencia' THEN 'Transferencia bancaria'
                 WHEN 'tarjeta' THEN 'Pago con tarjeta'
                 WHEN 'efectivo' THEN 'Pago en efectivo'
                 ELSE p.metodo_pago
               END,
               agente: a_pago.nombre,
               monto: p.monto,
               estado: p.estado,
               detalles: {
                 metodo_pago: p.metodo_pago,
                 pago_completo: p.pago_completo,
                 referencia: p.referencia
               },
               evento_tipo: 'pago'
             }
             ELSE null
           END as evento_pago
      
      // Obtener promesas
      OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(:Interaccion)-[:GENERA_PROMESA]->(pm:Promesa)
      OPTIONAL MATCH (pm)<-[:GENERA_PROMESA]-(i_promesa:Interaccion)-[:REALIZADA_POR]->(a_promesa:Agente)
      
      WITH c, evento_interaccion, evento_pago, agente,
           CASE 
             WHEN pm IS NOT NULL THEN {
               id: pm.id,
               tipo: 'promesa',
               timestamp: datetime(pm.fecha_promesa + 'T12:00:00Z'),
               titulo: CASE 
                 WHEN pm.cumplida THEN 'Promesa cumplida'
                 WHEN pm.fecha_vencimiento < date() THEN 'Promesa vencida'
                 ELSE 'Promesa de pago'
               END,
               descripcion: 'Promesa de pago por $' + toString(pm.monto_prometido),
               agente: a_promesa.nombre,
               monto: pm.monto_prometido,
               estado: pm.estado,
               detalles: {
                 fecha_vencimiento: pm.fecha_vencimiento,
                 cumplida: pm.cumplida,
                 monto_prometido: pm.monto_prometido
               },
               evento_tipo: 'promesa'
             }
             ELSE null
           END as evento_promesa
      
      // Unir todos los eventos
      WITH [evento_interaccion, evento_pago, evento_promesa] as todos_eventos, agente
      UNWIND todos_eventos as evento
      
      WITH evento, agente
      WHERE evento IS NOT NULL
      ${whereClause.replace('evento.tipo_contacto', 'evento.tipo_contacto').replace('agente.id', 'agente.id')}
      
      RETURN evento.id as id,
             evento.tipo as tipo,
             toString(evento.timestamp) as fecha,
             evento.titulo as titulo, 
             evento.descripcion as descripcion,
             evento.agente as agente,
             evento.monto as monto,
             evento.estado as estado,
             evento.detalles as detalles
      
      ORDER BY evento.timestamp DESC
    `;

    try {
      const records = await neo4jService.runQuery(query, parameters);
      
      return records.map(record => ({
        id: record.get('id'),
        tipo: record.get('tipo') as 'interaccion' | 'pago' | 'promesa',
        fecha: record.get('fecha'),
        titulo: record.get('titulo'),
        descripcion: record.get('descripcion'),
        agente: record.get('agente'),
        monto: record.get('monto'),
        estado: record.get('estado'),
        detalles: record.get('detalles') || {}
      }));
    } catch (error) {
      console.error('Error ejecutando query timeline:', error);
      return [];
    }
  }

}