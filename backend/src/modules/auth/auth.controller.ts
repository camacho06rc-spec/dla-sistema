import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { successResponseLegacy, errorResponse } from '../../utils/response';

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    successResponseLegacy(res, result, 'User registered successfully', 201);
  } catch (error: any) {
    errorResponse(res, error.message, 400);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    successResponseLegacy(res, result, 'Login successful');
  } catch (error: any) {
    errorResponse(res, error.message, 401);
  }
}
