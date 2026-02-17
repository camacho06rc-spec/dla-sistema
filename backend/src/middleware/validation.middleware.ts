import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return errorResponse(res, errors || 'Validation error', 400);
    }
  };
}
