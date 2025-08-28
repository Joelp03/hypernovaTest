import { AgenteEfectividad, AgenteNode, ClienteRaw, ClienteTimeline, TimelineEvent } from "@/types";
import { neo4jService } from "./neo4j.services";
import { int } from "neo4j-driver";


export class AgenteServices {
    private readonly neo4jClient = neo4jService
    // public async getAgentes(limite: number = 50): Promise<AgenteNode[]> {

    //     const query = `
    //       MATCH (a:Agente)
    //       RETURN 
    //         a.id as id, 
    //         a.nombre as nombre,  
    //         a.departamento as departamento,
    //         a.total_interacciones as total_interacciones,
    //         a.promesas_cumplidas as promesas_cumplidas,
    //         a.promesas_totales as promesas_totales,
    //         a.tasa_efectividad as tasa_efectividad,
    //         toString(a.created_at) as created_at,
    //         toString(a.updated_at) as updated_at
    //       ORDER BY a.nombre
    //       `;


    //     try {
    //         const records = await this.neo4jClient.runQuery(query);


    //          return records.map((record) => {
    //             return {
    //                 id: record.get("id"),
    //                 nombre: record.get("nombre"),
    //                 departamento: record.get("departamento"),
    //                 total_interacciones: record.get("total_interacciones").toNumber(),
    //                 promesas_cumplidas: record.get("promesas_cumplidas").toNumber(),
    //                 promesas_totales: record.get("promesas_totales").toNumber(),
    //                 tasa_efectividad: record.get("tasa_efectividad"),
    //                 created_at: record.get("created_at"),
    //                 updated_at: record.get("updated_at")
    //             }
    //         })


    //     } catch (error) {
    //         console.error("Error obteniendo clientes:", error);
    //         throw error;
    //     }
    // }


    public async getAgentes(limite: number = 50): Promise<AgenteNode[]> {
        const query = `
    MATCH (a:Agente)
    OPTIONAL MATCH (a)<-[:REALIZADA_POR]-(i:Interaccion)
    
    // Collect all interactions data first
    WITH a, collect(i) as interacciones
    
    // Process each interaction to calculate metrics
    UNWIND CASE WHEN size(interacciones) = 0 THEN [null] ELSE interacciones END as i
    
    OPTIONAL MATCH (i)-[:GENERO_PROMESA]->(pp:PromesaDePago)
    OPTIONAL MATCH (i)-[:GENERO_PAGO]->(p:Pago)  
    OPTIONAL MATCH (i)-[:GENERO_RENEGOCIACION]->(re:Renegociacion)
    
    // Check promise fulfillment (adjust logic based on your relationship model)
    OPTIONAL MATCH (i)-[:GENERO_PROMESA]->(pp_check:PromesaDePago)
    OPTIONAL MATCH (i)-[:GENERO_PAGO]->(p_check:Pago)
    WHERE p_check.fecha_pago >= pp_check.fecha_promesa 
      AND p_check.monto >= pp_check.monto
    
    // Aggregate per interaction
    WITH a, i,
         count(DISTINCT pp) as promesas_por_interaccion,
         count(DISTINCT p) as pagos_por_interaccion,
         count(DISTINCT re) as renegociaciones_por_interaccion,
         count(DISTINCT pp_check) as promesas_cumplidas_por_interaccion,
         sum(DISTINCT p.monto) as monto_pagos_por_interaccion
    
    // Final aggregation per agent
    WITH a,
         count(CASE WHEN i IS NOT NULL THEN 1 END) as total_interacciones,
         sum(promesas_por_interaccion) as promesas_totales,
         sum(promesas_cumplidas_por_interaccion) as promesas_cumplidas,
         sum(renegociaciones_por_interaccion) as total_renegociaciones,
         sum(monto_pagos_por_interaccion) as total_pagos_recaudados,
         
         // Call durations and sentiments from original interactions
         collect(CASE 
           WHEN i.tipo = 'llamada' AND i.duracion_segundos IS NOT NULL 
           THEN i.duracion_segundos 
         END) as duraciones_llamadas,
         collect(i.sentimiento) as todos_sentimientos
    
    // Calculate sentiment distribution
    WITH a, total_interacciones, promesas_totales, promesas_cumplidas, 
         total_renegociaciones, total_pagos_recaudados, duraciones_llamadas,
         [s IN todos_sentimientos WHERE s IS NOT NULL] as sentimientos_validos
    
    RETURN 
      a.id as id,
      a.nombre as nombre,
      a.departamento as departamento,
      toString(a.created_at) as created_at,
      toString(a.updated_at) as updated_at,
      
      total_interacciones,
      promesas_totales,
      promesas_cumplidas,
      total_renegociaciones,
      coalesce(total_pagos_recaudados, 0.0) as total_pagos_recaudados,
      
      // Effectiveness rate
      CASE 
        WHEN promesas_totales > 0 
        THEN round(promesas_cumplidas * 100.0 / promesas_totales, 2)
        ELSE 0.0 
      END as tasa_efectividad,
      
      // Average call duration
      CASE 
        WHEN size([d IN duraciones_llamadas WHERE d IS NOT NULL]) > 0
        THEN round(reduce(sum = 0.0, d IN duraciones_llamadas | sum + d) / size([d IN duraciones_llamadas WHERE d IS NOT NULL]), 2)
        ELSE 0.0
      END as duracion_promedio_llamadas,
      
      // Sentiment counts
      size([s IN sentimientos_validos WHERE s = 'positivo']) as sentimiento_positivo,
      size([s IN sentimientos_validos WHERE s = 'neutral']) as sentimiento_neutral,  
      size([s IN sentimientos_validos WHERE s = 'negativo']) as sentimiento_negativo
    
    ORDER BY a.nombre
    LIMIT $limite
  `;

        try {
            const records = await this.neo4jClient.runQuery(query, { limite: int(limite) });

            const agentes = records.map((record) => {
                return {
                    id: record.get("id"),
                    nombre: record.get("nombre"),
                    departamento: record.get("departamento"),
                    created_at: record.get("created_at"),
                    updated_at: record.get("updated_at"),

                    // Convert Neo4j integers to JavaScript numbers
                    total_interacciones: record.get("total_interacciones").toNumber(),
                    promesas_totales: record.get("promesas_totales").toNumber(),
                    total_renegociaciones: record.get("total_renegociaciones").toNumber(),
                    total_pagos_recaudados: record.get("total_pagos_recaudados").toNumber(),

                };
            });
            console.log("Agentes obtenidos:", agentes);

            return agentes;

        } catch (error) {
            console.error("Error obteniendo agentes:", error);
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
