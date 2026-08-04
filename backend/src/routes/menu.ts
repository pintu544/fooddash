import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/menu
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

export default router;
