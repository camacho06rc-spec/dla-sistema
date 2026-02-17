import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';
import { AuthRequest } from '../types';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    errorResponse(res, 'Invalid or expired token', 401);
  }
}

// Alias for consistency with problem statement
export const authenticate = authMiddleware;
