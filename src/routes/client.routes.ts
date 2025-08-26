import { Router, type Request, type Response,  } from 'express';
import type { ClienteTimeline, TimelineFilters } from '../types/index';

const router = Router();

// GET /api/clientes - Lista todos los clientes
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar servicio de GraphQL/Graphiti
    const clientes = [
      {
        id: 'cliente_001',
        nombre: 'Juan Pérez',
        telefono: '+507-1234-5678',
        estado_cuenta: 'moroso',
        total_deuda_actual: 2500.00,
        fecha_ultimo_contacto: '2024-02-15T10:30:00Z'
      }
    ];

    res.json({
      success: true,
      data: clientes,
      total: clientes.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/clientes/:id - Detalle de un cliente específico
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Consultar Graphiti por cliente específico
    const cliente = {
      id,
      nombre: 'Juan Pérez',
      telefono: '+507-1234-5678',
      email: 'juan.perez@email.com',
      estado_cuenta: 'moroso',
      total_deuda_actual: 2500.00,
      fecha_ultimo_contacto: '2024-02-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-15T10:30:00Z'
    };

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente no encontrado',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: cliente,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error obteniendo cliente ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/clientes/:id/timeline - Timeline de interacciones del cliente
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fechaInicio,
      fechaFin,
      tiposInteraccion,
      agentes,
      includePagos = 'true',
      includePromesas = 'true',
      limite = '50'
    } = req.query;

    // TODO: Implementar filtros y consulta a Graphiti
    const timeline: ClienteTimeline = {
      cliente: {
        id ,
        nombre: 'Juan Pérez',
        telefono: '+507-1234-5678',
        estado_cuenta: 'moroso',
        total_deuda_actual: 2500.00,
        fecha_ultimo_contacto: '2024-02-15T10:30:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-02-15T10:30:00Z'
      },
      deuda_actual: {
        id: 'deuda_001',
        cliente_id: id,
        monto_original: 3000.00,
        monto_actual: 2500.00,
        tipo_deuda: 'tarjeta_credito',
        fecha_creacion: '2024-01-01',
        estado: 'pendiente',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-02-15T10:30:00Z'
      },
      eventos: [
        {
          id: 'int_001',
          tipo: 'interaccion',
          fecha: '2024-02-15T10:30:00Z',
          titulo: 'Llamada saliente',
          descripcion: 'Contacto para seguimiento de pago',
          agente: 'María González',
          estado: 'promesa_pago',
          detalles: {
            duracion: 180,
            sentimiento: 'cooperativo',
            resultado: 'promesa_pago',
            monto_prometido: 500
          }
        },
        {
          id: 'pago_001',
          tipo: 'pago',
          fecha: '2024-02-10T14:20:00Z',
          titulo: 'Pago recibido',
          descripcion: 'Transferencia bancaria',
          monto: 500.00,
          estado: 'procesado',
          detalles: {
            metodo_pago: 'transferencia',
            pago_completo: false
          }
        }
      ],
      total_eventos: 2,
      periodo: {
        inicio: fechaInicio as string || '2024-01-01',
        fin: fechaFin as string || '2024-02-29'
      }
    };

    res.json({
      success: true,
      data: timeline,
      filtros_aplicados: {
        fechaInicio,
        fechaFin,
        tiposInteraccion: tiposInteraccion ? (tiposInteraccion as string).split(',') : [],
        agentes: agentes ? (agentes as string).split(',') : [],
        includePagos: includePagos === 'true',
        includePromesas: includePromesas === 'true',
        limite: parseInt(limite as string)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error obteniendo timeline cliente ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/clientes/:id/deudas - Estado de deudas del cliente
router.get('/:id/deudas', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Consultar todas las deudas del cliente en Graphiti
    const deudas = [
      {
        id: 'deuda_001',
        cliente_id: id,
        monto_original: 3000.00,
        monto_actual: 2500.00,
        tipo_deuda: 'tarjeta_credito',
        fecha_creacion: '2024-01-01',
        fecha_vencimiento: '2024-03-01',
        estado: 'pendiente'
      }
    ];

    const resumen = {
      total_deudas: deudas.length,
      monto_total_original: deudas.reduce((sum, d) => sum + d.monto_original, 0),
      monto_total_actual: deudas.reduce((sum, d) => sum + d.monto_actual, 0),
      monto_pagado: deudas.reduce((sum, d) => sum + (d.monto_original - d.monto_actual), 0),
      porcentaje_recuperado: 0
    };

    resumen.porcentaje_recuperado = resumen.monto_total_original > 0 
      ? (resumen.monto_pagado / resumen.monto_total_original) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        deudas,
        resumen
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error obteniendo deudas cliente ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/clientes/:id/interacciones - Interacciones recientes del cliente
router.get('/:id/interacciones', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limite = '20', offset = '0' } = req.query;

    // TODO: Consultar interacciones en Graphiti
    const interacciones = [
      {
        id: 'int_001',
        cliente_id: id,
        agente_id: 'agente_001',
        fecha: '2024-02-15T10:30:00Z',
        tipo_contacto: 'llamada_saliente',
        resultado: 'promesa_pago',
        duracion_segundos: 180,
        sentimiento: 'cooperativo'
      }
    ];

    res.json({
      success: true,
      data: interacciones,
      pagination: {
        total: interacciones.length,
        limite: parseInt(limite as string),
        offset: parseInt(offset as string),
        pagina_actual: Math.floor(parseInt(offset as string) / parseInt(limite as string)) + 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error obteniendo interacciones cliente ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as clientesRoutes };