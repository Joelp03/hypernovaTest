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
        // TODO: los pagos no tienen relación directa con el agente.
        // La query simplificada trae todos los datos necesarios para realizar los cálculos en TypeScript.
           const query = `
            MATCH (a:Agente {id: $agenteId})
            OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(i:Interaccion)
            OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(i_pago:Interaccion) WHERE i_pago.resultado = 'pago_inmediato'
            OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(ir:Interaccion) WHERE  ir.resultado = 'renegociacion'
 
            OPTIONAL MATCH (i)-[:GENERO_PROMESA]->(pp:PromesaDePago)
            OPTIONAL MATCH (i)-[:GENERO_PAGO]->(p:Pago)
            // Se realiza un segundo OPTIONAL MATCH para contar las promesas cumplidas.
            // Esta ruta no interfiere con el cálculo del monto total.
            OPTIONAL MATCH (i)-[:GENERO_PROMESA]->(pp_cumplida:PromesaDePago)<-[:CUMPLE_PROMESA]-(:Pago)

            WITH a,
                COUNT(DISTINCT i) as total_interacciones,
                COUNT(DISTINCT pp) as promesas_generadas,
                COUNT (DISTINCT i_pago) as pagos_inmediatos,
                COUNT (DISTINCT ir) as renegociaciones,
                COUNT(DISTINCT pp_cumplida) as promesas_cumplidas,
                sum(p.monto) as monto_recuperado,
                avg(i.duracion_segundos) as tiempo_promedio_llamada
            
            RETURN  
                a.id as id,
                a.nombre as nombre,  
                a.departamento as departamento,
                total_interacciones,
                promesas_generadas,
                promesas_cumplidas,
                monto_recuperado,
                tiempo_promedio_llamada,
                pagos_inmediatos,
                renegociaciones
        `;

        const data = await this.neo4jClient.runQuery(query, { agenteId });
        const record = data[0];

        // Validamos si se encontró algún registro para el agente
        if (!record || !record.get("id")) {
            return null;
        }

        // Se agrega el operador de encadenamiento opcional (?) y el operador de
        // fusión de nulos (??) para manejar de forma segura los valores nulos que
        // pueden retornar las agregaciones como sum() y avg() cuando no hay datos.
        const totalInteracciones = record.get("total_interacciones")?.toNumber() ?? 0;
        const promesasGeneradas = record.get("promesas_generadas")?.toNumber() ?? 0;
        const promesasCumplidas = record.get("promesas_cumplidas")?.toNumber() ?? 0;
        const montoRecuperado = record.get("monto_recuperado")?.toNumber() ?? 0;
        const tiempoPromedioLlamada = record.get("tiempo_promedio_llamada");
        const pagosInmediatos = record.get("pagos_inmediatos")?.toNumber() ?? 0;
        const renegociaciones = record.get("renegociaciones")?.toNumber() ?? 0;
        

        return {
            agente: record.get("id"),
            metricas: {
                total_interacciones: totalInteracciones,
                promesas_generadas: promesasGeneradas,
                promesas_cumplidas: promesasCumplidas,
                tasa_cumplimiento: promesasGeneradas > 0
                    ? (promesasCumplidas / promesasGeneradas) * 100
                    : 0,
                monto_recuperado: montoRecuperado,
                tiempo_promedio_llamada: tiempoPromedioLlamada,
                pagos_inmediatos: pagosInmediatos,
                renegociaciones: renegociaciones
            }
        };
    }

}
