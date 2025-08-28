import express, { type NextFunction, type Request, type Response } from 'express';
import { clientesRoutes } from './routes/client.routes';
import { agentesRoutes } from './routes/agentes.routes';
import { analyticRoutes } from './routes/analtytic.routes';
import cors from 'cors'


const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ===== HEALTH CHECK =====

app.get('/health', (req: Request, res: Response) => {
  res.json({message: "ok"}).status(200);
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/agentes', agentesRoutes);
app.use('/api/analytics', analyticRoutes);



app.listen(PORT, () => {
  console.log(`Server listening port http://localhost:${PORT}`);
});