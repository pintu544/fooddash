import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

const app = createApp('http://localhost:3000');

beforeAll(async () => {
  // Seed a couple of test menu items
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Test Pizza',
        description: 'A test pizza',
        price: 9.99,
        imageUrl: 'https://example.com/pizza.jpg',
        category: 'pizza',
      },
      {
        name: 'Test Burger',
        description: 'A test burger',
        price: 7.99,
        imageUrl: 'https://example.com/burger.jpg',
        category: 'burger',
      },
    ],
    skipDuplicates: true,
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/menu', () => {
  it('returns 200 with an array of menu items', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('each item has required fields', async () => {
    const res = await request(app).get('/api/menu');
    const item = res.body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('description');
    expect(item).toHaveProperty('price');
    expect(item).toHaveProperty('imageUrl');
  });
});
