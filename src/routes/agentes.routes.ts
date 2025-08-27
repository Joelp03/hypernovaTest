import { AgenteServices } from '@/services/agente.services';
import { Router, type Request, type Response, } from 'express';

const router = Router();

const agenteServices = new AgenteServices()
router.get('/', async (req: Request, res: Response) => {
  try {
    const agentes = await agenteServices.getAgentes()

    res.json({
      success: true,
      data: agentes,
      total: agentes.length,
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

//GET /agentes/{id}/efectividad
router.get('/:id/efectividad', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const efectividad = await agenteServices.getEfectidadByAgenteId(id)

    res.json({
      success: true,
      data: efectividad,
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


export { router as agentesRoutes };