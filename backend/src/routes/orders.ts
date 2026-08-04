import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { startOrderTimer, cancelOrderTimer } from '../lib/orderTimer';
import { getIO } from '../lib/socket';

const router = Router();

// Validation schemas
const OrderItemSchema = z.object({
  menuItemId: z.string().min(1, 'menuItemId is required'),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
});

const UpdateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
    }),
  }),
});

// POST /api/orders
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateOrderSchema.parse(req.body);

    const total = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        address: body.address,
        phone: body.phone,
        items: body.items,
        total: Math.round(total * 100) / 100,
        status: 'RECEIVED',
      },
    });

    // Kick off auto-advance timer
    startOrderTimer(order.id);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!order) {
      const err = Object.assign(new Error('Order not found'), {
        statusCode: 404,
      });
      return next(err);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status  (admin override)
router.patch(
  '/:id/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = UpdateStatusSchema.parse(req.body);

      const existing = await prisma.order.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        const err = Object.assign(new Error('Order not found'), {
          statusCode: 404,
        });
        return next(err);
      }

      // Cancel any pending auto-advance timers
      cancelOrderTimer(req.params.id);

      const order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
      });

      // Emit real-time update
      try {
        getIO().to(`order:${order.id}`).emit('status:update', {
          orderId: order.id,
          status: order.status,
        });
      } catch {
        // Socket may not be initialised in test environment
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
