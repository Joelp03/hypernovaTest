
// src/app.ts
import express, { type NextFunction, type Request, type Response } from 'express';
import { clientesRoutes } from './routes/client.routes';
import { DataLoader } from './loaders/load-data';
// import { agentesRoutes } from './routes/agentes.routes.js';
// import { analyticsRoutes } from './routes/analytics.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====

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

app.get("/load-data", async (req: Request, res: Response) => {
    let dataLoader =  new DataLoader()
    await dataLoader.loadData()
    return res.status(200).json({message: "load data successfully"})
})
// ===== RUTAS API =====

app.use('/api/clientes', clientesRoutes);
//app.use('/api/agentes', agentesRoutes);
// app.use('/api/analytics', analyticsRoutes);





app.listen(PORT, () => {
  console.log(`Server listening port http://localhost:${PORT}`);
});