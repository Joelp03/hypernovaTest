// src/types/index.ts

// ===== TIPOS BASE DEL JSON =====

export interface Metadata {
  fecha_generacion: string;
  total_clientes: number;
  total_interacciones: number;
  periodo: string;
}

export interface ClienteRaw {
  id: string;
  nombre: string;
  telefono: string;
  monto_deuda_inicial: number;
  fecha_prestamo: string;
  tipo_deuda: 'tarjeta_credito' | 'prestamo_personal' | 'hipoteca' | 'auto';
}

export interface PlanPago {
  cuotas: number;
  monto_mensual: number;
}

export interface InteraccionRaw {
  id: string;
  cliente_id: string;
  timestamp: string;
  tipo: 'llamada_saliente' | 'llamada_entrante' | 'email' | 'sms' | 'pago_recibido';
  
  // Campos condicionales para llamadas
  duracion_segundos?: number;
  agente_id?: string;
  resultado?: 'promesa_pago' | 'sin_respuesta' | 'renegociacion' | 'disputa' | 'pago_inmediato' | 'se_niega_pagar';
  sentimiento?: 'cooperativo' | 'neutral' | 'frustrado' | 'hostil' | 'n/a';
  
  // Para promesas de pago
  monto_prometido?: number;
  fecha_promesa?: string;
  
  // Para renegociación
  nuevo_plan_pago?: PlanPago;
  
  // Para pagos
  monto?: number;
  metodo_pago?: 'transferencia' | 'tarjeta' | 'efectivo';
  pago_completo?: boolean;
}

export interface DataSourceJson {
  metadata: Metadata;
  clientes: ClienteRaw[];
  interacciones: InteraccionRaw[];
}

// ===== ENTIDADES DEL GRAFO =====

export interface ClienteNode {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  total_deuda_actual: number;
  fecha_ultimo_contacto: string;
  created_at: string;
  updated_at: string;
}

export interface AgenteNode {
  id: string;
  nombre: string;
  departamento: string;
  total_interacciones: number;
  promesas_totales: number;
  created_at: string;
  updated_at: string;
}

export interface DeudaNode {
  id: string;
  cliente_id: string;
  monto_original: number;
  monto_actual: number;
  tipo_deuda: string;
  fecha_creacion: string;
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'pagada' | 'vencida' | 'renegociada';
  created_at: string;
  updated_at: string;
}

export interface InteraccionNode {
  id: string;
  cliente_id: string;
  agente_id?: string;
  fecha: string;
  hora: string;
  timestamp: string;
  tipo_contacto: string;
  resultado?: string;
  sentimiento?: string;
  duracion_segundos?: number;
  notas?: string;
  created_at: string;
}

export interface PagoNode {
  id: string;
  interaccion_id?: string;
  cliente_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  estado: 'procesado' | 'pendiente' | 'rechazado';
  pago_completo: boolean;
  referencia?: string;
  created_at: string;
}



// ===== RELACIONES DEL GRAFO =====

export interface Relationship {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, any>;
  created_at: string;
}

export type RelationshipType = 
  | 'TIENE_DEUDA'
  | 'PARTICIPA_EN'
  | 'REALIZADA_POR'
  | 'GENERA_PAGO'
  | 'GENERA_PROMESA'
  | 'CUMPLIDA_CON'
  | 'INCUMPLIDA'
  | 'SIGUIENTE_INTERACCION'
  | 'ACTUALIZA_DEUDA';

// ===== TIPOS PARA API RESPONSES =====

// export interface TimelineEvent {
//   id: string;
//   tipo: 'interaccion' | 'pago' | 'promesa';
//   fecha: string;
//   agente?: string;
//   monto?: number;
//   estado?: string;
//   detalles: Record<string, any>;
// }

export interface TimelineEvent {
  id: string;
  tipo: 'interaccion' | 'pago' | 'promesa' | 'renegociacion';
  fecha: string;
  titulo: string;
  descripcion: string;
  agente?: string;
  monto?: number;
  estado?: string;
  detalles: Record<string, any>;
}

export interface ClienteTimeline {
  cliente: ClienteNode;
  deuda_actual: DeudaNode;
  eventos: TimelineEvent[];
  total_eventos: number;
  periodo: {
    inicio: string;
    fin: string;
  };
}

export interface AgenteEfectividad {
  agente: AgenteNode;
  metricas: {
    total_interacciones: number;
    promesas_generadas: number;
    promesas_cumplidas: number;
    tasa_cumplimiento: number;
    monto_recuperado: number;
    tiempo_promedio_llamada: number;
    pagos_inmediatos: number;
    renegociaciones: number;
    // distribución_sentimientos: Record<string, number>;
    // mejores_horarios: Array<{
    //   hora: number;
    //   efectividad: number;
    // }>;
  };
  // periodo: {
  //   inicio: string;
  //   fin: string;
  // };
}


export interface KPIsDashboard {
  tasa_recuperacion: number;
  promesas_cumplidas: number;
  monto_total_recuperado: number;
  clientes_activos: number;
  interacciones_ultimo_mes: number;
  tiempo_promedio_resolucion: number;
  distribucion_tipos_deuda: Record<string, number>;
  evolucion_mensual: Array<{
    mes: string;
    recuperado: number;
    promesas: number;
    interacciones: number;
  }>;
}

export interface MejorHorario {
  hora: number;
  dia_semana?: number;
  total_interacciones: number;
  total_exitosas: number;
  tasa_exito: number;
  monto_promedio_recuperado: number;
}

// ===== TIPOS PARA VALIDACIONES =====

export interface ValidacionResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  stats: {
    clientes_procesados: number;
    interacciones_procesadas: number;
    promesas_detectadas: number;
    pagos_detectados: number;
  };
}

// ===== TIPOS PARA SERVICIOS =====

export interface GraphitiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface GraphitiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface DataProcessingOptions {
  batchSize: number;
  validateData: boolean;
  skipExisting: boolean;
  logProgress: boolean;
}

// ===== TIPOS PARA FILTROS Y QUERIES =====

export interface TimelineFilters {
  fechaInicio?: string;
  fechaFin?: string;
  tiposInteraccion?: string[];
  agentes?: string[];
  resultados?: string[];
  includePagos?: boolean;
  includePromesas?: boolean;
}

export interface GraphFilters {
  tiposEntidad?: string[];
  tiposRelacion?: RelationshipType[];
  fechaInicio?: string;
  fechaFin?: string;
  profundidad?: number;
  limite?: number;
}

export interface AnalyticsQuery {
  periodo: {
    inicio: string;
    fin: string;
  };
  groupBy?: 'dia' | 'semana' | 'mes';
  filtros?: {
    clientes?: string[];
    agentes?: string[];
    tiposDeuda?: string[];
    estados?: string[];
  };
}

export interface PromesaIncumplida  {
    clienteId: string;
    promesaId: string;
    montoPrometido: number;
    fechaPromesa: string;
    totalPagado: number;
    saldoIncumplido: number;
}

export interface InteraccionEfectivaHorario {
    hora: number;
    exitosas: number;
    totalInteracciones: number;
    efectividad: number;
}