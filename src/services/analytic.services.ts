import { neo4jService } from "./neo4j.services";
import { InteraccionEfectiva, PromesaIncumplida } from "@/types";
import { safeToNumber } from "@/utils";

export class AnalyticServices {
    private readonly neo4jClient = neo4jService

    async getPromesasIncumplidas(): Promise<PromesaIncumplida[]> {
        const query = `
    MATCH (c:Cliente)-[:PARTICIPA_EN]->(i:Interaccion)-[:GENERO_PROMESA]->(pp:PromesaDePago)
    OPTIONAL MATCH (c)-[:PARTICIPA_EN]->(i2:Interaccion)-[:GENERO_PAGO]->(p:Pago)
    WHERE date(i2.timestamp) <= pp.fecha_promesa
    WITH c, pp, SUM(COALESCE(p.monto,0)) AS total_pagado
    WHERE total_pagado < pp.monto AND date() > pp.fecha_promesa
    RETURN c.id AS cliente_id, pp.id AS promesa_id, pp.monto AS monto_prometido, 
           toString(pp.fecha_promesa) AS fecha_promesa, total_pagado, 
           (pp.monto - total_pagado) AS saldo_incumplido
    ORDER BY pp.fecha_promesa ASC
  `;

        const result = await this.neo4jClient.runQuery(query);
        const records = result.map(record => {
            return {
                clienteId: record.get('cliente_id'),
                promesaId: record.get('promesa_id'),
                montoPrometido: record.get('monto_prometido'),
                fechaPromesa: record.get('fecha_promesa'),
                totalPagado: safeToNumber(record.get('total_pagado')),
                saldoIncumplido: record.get('saldo_incumplido')
            }
        })

        return records;

    }

    async getMejoresHorariosDeInteraccionEfectiva(): Promise<InteraccionEfectiva[]> {

        const query = `
            MATCH (i:Interaccion)
            WITH i, datetime(i.timestamp) AS timestamp
            WITH timestamp.hour AS hora,
                CASE WHEN i.resultado IN ["promesa_pago", "pago_recibido"] THEN 1 ELSE 0 END AS exitosa, i
            
            WITH hora,
                sum(exitosa) AS exitosas,
                count(i) AS total
            
            RETURN hora,
                exitosas,
                total,
                round(toFloat(exitosas) / total * 100, 2) AS efectividad
            ORDER BY efectividad DESC
        `;

            const results = await this.neo4jClient.runQuery(query);

            const data = results.map(record => {
                return {
                    hora: safeToNumber(record.get("hora")),
                    exitosas: safeToNumber(record.get("exitosas")),
                    totalInteracciones: safeToNumber(record.get("total")),
                    efectividad: safeToNumber(record.get("efectividad"))
                }
            })

            return data;
    }
}

