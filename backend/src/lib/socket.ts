import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export function initSocket(server: HttpServer, frontendUrl: string): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: frontendUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    const orderId = socket.handshake.query.orderId as string | undefined;
    if (orderId) {
      socket.join(`order:${orderId}`);
    }

    socket.on('join:order', (id: string) => {
      socket.join(`order:${id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialised. Call initSocket() first.');
  }
  return io;
}
