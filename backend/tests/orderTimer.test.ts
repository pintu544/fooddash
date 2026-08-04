import { startOrderTimer, cancelOrderTimer, statusTimers } from '../src/lib/orderTimer';
import { prisma } from '../src/lib/prisma';

// Mock prisma
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    order: {
      update: jest.fn().mockResolvedValue({ id: 'order-1', status: 'PREPARING' }),
    },
  },
}));

// Mock socket
jest.mock('../src/lib/socket', () => ({
  getIO: () => ({
    to: () => ({ emit: jest.fn() }),
  }),
}));

describe('startOrderTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    statusTimers.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    statusTimers.clear();
  });

  it('registers timers for the order', () => {
    startOrderTimer('order-1');
    expect(statusTimers.has('order-1')).toBe(true);
    expect(statusTimers.get('order-1')!.length).toBe(3);
  });

  it('calls prisma.order.update after 10s with PREPARING', async () => {
    startOrderTimer('order-1');
    jest.advanceTimersByTime(10_000);
    await Promise.resolve(); // flush microtasks
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { status: 'PREPARING' },
    });
  });
});

describe('cancelOrderTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    statusTimers.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
    statusTimers.clear();
  });

  it('clears timers and removes the order from the map', () => {
    startOrderTimer('order-2');
    expect(statusTimers.has('order-2')).toBe(true);

    cancelOrderTimer('order-2');
    expect(statusTimers.has('order-2')).toBe(false);
  });

  it('does not call prisma.order.update after cancellation', async () => {
    (prisma.order.update as jest.Mock).mockClear();
    startOrderTimer('order-3');
    cancelOrderTimer('order-3');
    jest.advanceTimersByTime(10_000);
    await Promise.resolve();
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
