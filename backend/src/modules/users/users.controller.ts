import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { successResponseLegacy, errorResponse, successResponse } from '../../utils/response';
import { AuthRequest } from '../../types';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  resetPasswordSchema,
  getUsersQuerySchema,
} from './users.dto';

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

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await usersService.createUser(data);
    res.status(201).json(successResponse(user, 'Usuario creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getUsersQuerySchema.parse(req.query);
    const result = await usersService.getUsers(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id, data);
    res.json(successResponse(user, 'Usuario actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.deleteUser(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const data = changePasswordSchema.parse(req.body);
    const result = await usersService.changePassword(req.user.userId, data);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await usersService.resetPassword(data);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getUserPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.getUserPermissions(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
