import { Request, Response, NextFunction } from 'express';
import { PermissionsService } from './permissions.service';
import { successResponse } from '../../utils/response';
import { createPermissionSchema } from '../users/users.dto';

const service = new PermissionsService();

export const createPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPermissionSchema.parse(req.body);
    const permission = await service.createPermission(data);
    res.status(201).json(successResponse(permission, 'Permiso creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permissions = await service.getPermissions();
    res.json(successResponse(permissions));
  } catch (error) {
    next(error);
  }
};

export const getPermissionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const permission = await service.getPermissionById(req.params.id);
    res.json(successResponse(permission));
  } catch (error) {
    next(error);
  }
};

export const deletePermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deletePermission(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
