import { Request, Response, NextFunction } from 'express';
import { RolesService } from './roles.service';
import { successResponse } from '../../utils/response';
import { createRoleSchema, updateRoleSchema, assignPermissionsSchema } from '../users/users.dto';

const service = new RolesService();

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createRoleSchema.parse(req.body);
    const role = await service.createRole(data);
    res.status(201).json(successResponse(role, 'Rol creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await service.getRoles();
    res.json(successResponse(roles));
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await service.getRoleById(req.params.id);
    res.json(successResponse(role));
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateRoleSchema.parse(req.body);
    const role = await service.updateRole(req.params.id, data);
    res.json(successResponse(role, 'Rol actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteRole(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const assignPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = assignPermissionsSchema.parse(req.body);
    const role = await service.assignPermissions(data);
    res.json(successResponse(role, 'Permisos asignados exitosamente'));
  } catch (error) {
    next(error);
  }
};
