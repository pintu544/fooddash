import { OrderStatus } from '@prisma/client';
import { prisma } from './prisma';
import { getIO } from './socket';

// Map of orderId → array of pending timer handles
export const statusTimers: Map<string, ReturnType<typeof setTimeout>[]> =
  new Map();

// Status progression and delays (ms)
const STATUS_SEQUENCE: { status: OrderStatus; delay: number }[] = [
  { status: 'PREPARING', delay: 10_000 },
  { status: 'OUT_FOR_DELIVERY', delay: 30_000 },
  { status: 'DELIVERED', delay: 60_000 },
];

export function startOrderTimer(orderId: string): void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let elapsed = 0;

  for (const { status, delay } of STATUS_SEQUENCE) {
    elapsed += delay;
    const t = setTimeout(async () => {
      try {
        // Check if timers were cancelled for this order
        if (!statusTimers.has(orderId)) return;

        const updated = await prisma.order.update({
          where: { id: orderId },
          data: { status },
        });

        getIO().to(`order:${orderId}`).emit('status:update', {
          orderId,
          status: updated.status,
        });
      } catch {
        // Order may have been deleted or DB unavailable
      }
    }, elapsed);

    timers.push(t);
  }

  statusTimers.set(orderId, timers);
}

export function cancelOrderTimer(orderId: string): void {
  const timers = statusTimers.get(orderId);
  if (timers) {
    timers.forEach(clearTimeout);
    statusTimers.delete(orderId);
  }
}
