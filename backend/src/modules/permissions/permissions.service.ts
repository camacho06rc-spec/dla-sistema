import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreatePermissionDTO } from '../users/users.dto';

const PERMISSION_SELECT = {
  id: true,
  name: true,
  description: true,
  module: true,
  action: true,
  createdAt: true,
  updatedAt: true,
};

export class PermissionsService {
  async createPermission(data: CreatePermissionDTO) {
    const existing = await prisma.permission.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError(409, 'Ya existe un permiso con ese nombre');

    return prisma.permission.create({ data, select: PERMISSION_SELECT });
  }

  async getPermissions() {
    return prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { action: 'asc' }], select: PERMISSION_SELECT });
  }

  async getPermissionById(id: string) {
    const permission = await prisma.permission.findUnique({ where: { id }, select: PERMISSION_SELECT });
    if (!permission) throw new AppError(404, 'Permiso no encontrado');
    return permission;
  }

  async deletePermission(id: string) {
    await this.getPermissionById(id);

    const assignedCount = await prisma.rolePermission.count({ where: { permissionId: id } });
    if (assignedCount > 0) {
      throw new AppError(400, `No se puede eliminar. El permiso está asignado a ${assignedCount} rol(es)`);
    }

    await prisma.permission.delete({ where: { id } });
    return { message: 'Permiso eliminado exitosamente' };
  }
}
