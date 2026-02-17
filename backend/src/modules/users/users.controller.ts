import { Response } from 'express';
import { UsersService } from './users.service';
import { successResponseLegacy, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

const usersService = new UsersService();

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const user = await usersService.getProfile(req.user.userId);
    successResponseLegacy(res, user);
  } catch (error: any) {
    errorResponse(res, error.message, 404);
  }
}
