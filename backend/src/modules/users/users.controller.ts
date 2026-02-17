import { Response } from 'express';
import { UsersService } from './users.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

const usersService = new UsersService();

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const user = await usersService.getProfile(req.user.userId);
    return successResponse(res, user);
  } catch (error: any) {
    return errorResponse(res, error.message, 404);
  }
}
