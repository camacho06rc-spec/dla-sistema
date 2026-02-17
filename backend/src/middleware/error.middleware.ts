import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
}
