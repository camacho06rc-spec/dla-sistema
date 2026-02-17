import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../config/database';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export async function getHealthDb(_req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    successResponse(res, {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    errorResponse(res, 'Database connection failed', 500);
  }
}
