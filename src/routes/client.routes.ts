import { Router, type Request, type Response, } from 'express';
import type { ClienteTimeline, TimelineFilters } from '../types/index';
import { ClientServices } from '@/services/client.services';

const router = Router();

const clientServices = new ClientServices()
// GET /api/clientes - Lista todos los clientes
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientes = await clientServices.getClients()

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

// GET /api/clientes/:id/timeline - Timeline de interacciones del cliente
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
  
    const timeline = await clientServices.getClienteTimeline(id)

    res.json({
      success: true,
      data: timeline,
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

export { router as clientesRoutes };