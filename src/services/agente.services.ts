import { AgenteEfectividad, AgenteNode, ClienteRaw, ClienteTimeline, TimelineEvent } from "@/types";
import { neo4jService } from "./neo4j.services";


export class AgenteServices {
    private readonly neo4jClient = neo4jService
    public async getAgentes(limite: number = 50): Promise<AgenteNode[]> {

        const query = `
          MATCH (a:Agente)
          RETURN 
            a.id as id, 
            a.nombre as nombre,  
            a.departamento as departamento,
            a.total_interacciones as total_interacciones,
            a.promesas_cumplidas as promesas_cumplidas,
            a.promesas_totales as promesas_totales,
            a.tasa_efectividad as tasa_efectividad,
            toString(a.created_at) as created_at,
            toString(a.updated_at) as updated_at
          ORDER BY a.nombre
          `;


        try {
            const records = await this.neo4jClient.runQuery(query);


             return records.map((record) => {
                return {
                    id: record.get("id"),
                    nombre: record.get("nombre"),
                    departamento: record.get("departamento"),
                    total_interacciones: record.get("total_interacciones").toNumber(),
                    promesas_cumplidas: record.get("promesas_cumplidas").toNumber(),
                    promesas_totales: record.get("promesas_totales").toNumber(),
                    tasa_efectividad: record.get("tasa_efectividad"),
                    created_at: record.get("created_at"),
                    updated_at: record.get("updated_at")
                }
            })


        } catch (error) {
            console.error("Error obteniendo clientes:", error);
            throw error;
        }
    }

    public async getEfectidadByAgenteId(agenteId: string): Promise<AgenteEfectividad | null> {
        const query = `
        MATCH (a:Agente {id: $agenteId})
        OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(i:Interaccion)
        OPTIONAL MATCH (i)-[:GENERO_PROMESA]->(p:PromesaDePago)
        OPTIONAL MATCH (i)-[:GENERO_PAGO]->(pago:Pago ) WHERE pago.es_completo = TRUE

        WITH a, i, p, pago
        
        a.id as id, 
        a.nombre as nombre,  
        a.departamento as departamento,
        count(DISTINCT i) as total_interacciones,
        count(DISTINCT p) as promesas_generadas,
        count(DISTINCT pago) as promesas_cumplidas,
        sum(coalesce(pago.monto, 0))
        `

        const data  = await this.neo4jClient.runQuery(query, { agenteId })
        const record = data[0]

        console.log(data)
        return {
            agente: record.get("id"),
            metricas: {
                total_interacciones: record.get("total_interacciones").toNumber(),
                promesas_generadas: record.get("promesas_generadas").toNumber(),
                promesas_cumplidas: record.get("promesas_cumplidas").toNumber(),
                tasa_cumplimiento: record.get("promesas_generadas").toNumber() > 0
                    ? (record.get("promesas_cumplidas").toNumber() / record.get("promesas_generadas").toNumber()) * 100
                    : 0,
                monto_recuperado: record.get("monto_recuperado").toNumber(),
                tiempo_promedio_llamada: record.get("tiempo_promedio_llamada"),
            }
        }
    }
}


//  // Efectividad de agente
//  async getAgenteEfectividad(agenteId: string, fechaInicio?: string, fechaFin?: string): Promise<any> {
//     const agente = await this.runQuery(`
//       MATCH (a:Agente {id: $agenteId}) 
//       RETURN a
//     `, { agenteId });
    
//     if (agente.length === 0) return null;

//     const metricas = await this.runQuery(`
//       MATCH (a:Agente {id: $agenteId})<-[:REALIZADA_POR]-(i:Interaccion)
//       OPTIONAL MATCH (i)-[:GENERA_PROMESA]->(p:Promesa)
//       OPTIONAL MATCH (p)-[:CUMPLIDA_CON]->(pago:Pago)
//       OPTIONAL MATCH (i)-[:GENERA_PAGO]->(pago_directo:Pago)
      
//       WITH i, p, pago, pago_directo
      
//       RETURN count(DISTINCT i) as total_interacciones,
//              count(DISTINCT p) as promesas_generadas,
//              count(DISTINCT pago) as promesas_cumplidas,
//              sum(coalesce(pago.monto, 0) + coalesce(pago_directo.monto, 0)) as monto_recuperado,
//              avg(i.duracion_segundos) as tiempo_promedio_llamada
//     `, { agenteId });

//     return {
//       agente: agente[0].get('a').properties,
//       metricas: metricas[0] ? {
//         total_interacciones: metricas[0].get('total_interacciones'),
//         promesas_generadas: metricas[0].get('promesas_generadas'),
//         promesas_cumplidas: metricas[0].get('promesas_cumplidas'),
//         tasa_cumplimiento: metricas[0].get('promesas_generadas') > 0 
//           ? (metricas[0].get('promesas_cumplidas') / metricas[0].get('promesas_generadas')) * 100 
//           : 0,
//         monto_recuperado: metricas[0].get('monto_recuperado'),
//         tiempo_promedio_llamada: metricas[0].get('tiempo_promedio_llamada'),
//         distribución_sentimientos: {},
//         mejores_horarios: []
//       } : null
//     };
//   }