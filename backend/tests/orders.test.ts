import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { statusTimers } from '../src/lib/orderTimer';

// Mock Socket.io so tests don't need a running server
jest.mock('../src/lib/socket', () => ({
  getIO: () => ({
    to: () => ({ emit: jest.fn() }),
  }),
  initSocket: jest.fn(),
}));

// Mock the order timer to prevent real setTimeout in tests
jest.mock('../src/lib/orderTimer', () => {
  const original = jest.requireActual('../src/lib/orderTimer');
  return {
    ...original,
    startOrderTimer: jest.fn(),
    cancelOrderTimer: jest.fn(),
  };
});

const app = createApp('http://localhost:3000');

const validOrder = {
  customerName: 'Jane Doe',
  address: '123 Main Street, Springfield',
  phone: '+1 555-0100',
  items: [
    {
      menuItemId: 'item-1',
      name: 'Test Pizza',
      price: 9.99,
      quantity: 2,
    },
  ],
};

afterAll(async () => {
  await prisma.order.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/orders', () => {
  it('returns 201 with created order for valid payload', async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('RECEIVED');
    expect(res.body.customerName).toBe('Jane Doe');
    expect(res.body.total).toBeCloseTo(19.98);
  });

  it('returns 400 when customerName is missing', async () => {
    const { customerName: _, ...body } = validOrder;
    const res = await request(app).post('/api/orders').send(body);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('returns 400 when items array is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('items');
  });

  it('returns 400 when phone is invalid', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ ...validOrder, phone: 'not-a-phone' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders/:id', () => {
  let orderId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    orderId = res.body.id;
  });

  it('returns 200 with the order for a valid id', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/orders/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Order not found');
  });
});

describe('PATCH /api/orders/:id/status', () => {
  let orderId: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/orders').send(validOrder);
    orderId = res.body.id;
  });

  it('updates the order status successfully', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'PREPARING' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PREPARING');
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown order id', async () => {
    const res = await request(app)
      .patch('/api/orders/nonexistent-id/status')
      .send({ status: 'PREPARING' });
    expect(res.status).toBe(404);
  });
});
