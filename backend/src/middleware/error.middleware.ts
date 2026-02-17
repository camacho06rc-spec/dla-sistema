import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  errorResponse(res, message, statusCode);
}
