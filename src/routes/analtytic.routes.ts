import { AnalyticServices } from '@/services/analytic.services';
import { Router, type Request, type Response, } from 'express';

const router = Router();

const analyticServices = new AnalyticServices()
//GET /analytics/promesas-incumplidas - Clientes con promesas vencidas
router.get('/promesas-incumplidas', async (req: Request, res: Response) => {
    try {
        const analytics = await analyticServices.getPromesasIncumplidas()

        res.json({
            success: true,
            data: analytics,
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

// GET /analytics/mejores-horarios
router.get('/mejores-horarios', async (req: Request, res: Response) => {
    try {
        const analytics = await analyticServices.getMejoresHorariosDeInteraccionEfectiva()

        res.json({
            success: true,
            data: analytics,
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

export { router as analyticRoutes };
