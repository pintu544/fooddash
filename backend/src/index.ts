import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { initSocket } from './lib/socket';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const app = createApp(FRONTEND_URL);
const server = http.createServer(app);

initSocket(server, FRONTEND_URL);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io attached`);
});

export { server };
