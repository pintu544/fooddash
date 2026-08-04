'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { OrderStatus } from '@/types';

interface UseOrderStatusResult {
  status: OrderStatus;
  connected: boolean;
}

export function useOrderStatus(
  orderId: string,
  initialStatus: OrderStatus,
): UseOrderStatusResult {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

    const socket: Socket = io(SOCKET_URL, {
      query: { orderId },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      // Explicitly join the room in case query param wasn't processed
      socket.emit('join:order', orderId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(
      'status:update',
      (data: { orderId: string; status: OrderStatus }) => {
        if (data.orderId === orderId) {
          setStatus(data.status);
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return { status, connected };
}
