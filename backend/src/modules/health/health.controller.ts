import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../config/database';

export async function getHealth(req: Request, res: Response) {
  return successResponse(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export async function getHealthDb(req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return successResponse(res, {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(res, 'Database connection failed', 500);
  }
}
