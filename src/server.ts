import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import { env } from './config/env';
import { prisma } from './database/prisma';
import authRoutes from './modules/auth/auth.routes';
import giftRoutes from './modules/gifts/gifts.routes';
import footballRoutes from './modules/football/football.routes';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'betting-platform-backend', database: 'connected' });
  } catch {
    res.status(503).json({ ok: false, service: 'betting-platform-backend', database: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/gifts', giftRoutes);
// Public sports-data proxy. The API-Sports key stays on this server and is never sent to browsers.
app.use('/api/football', footballRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Internal server error.' });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: env.WS_PATH });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'connected', message: 'Sportsbook realtime channel connected.' }));
});

server.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT}`);
  console.log(`WebSocket listening at ${env.WS_PATH}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
