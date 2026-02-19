import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateRoleDTO, UpdateRoleDTO, AssignPermissionsDTO } from '../users/users.dto';

const ROLE_SELECT = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  rolePermissions: {
    select: {
      permission: {
        select: { id: true, name: true, module: true, action: true },
      },
    },
  },
  _count: {
    select: { userRoles: true },
  },
};

export class RolesService {
  async createRole(data: CreateRoleDTO) {
    const { permissionIds, ...rest } = data;

    const existing = await prisma.role.findUnique({ where: { name: rest.name } });
    if (existing) throw new AppError(409, 'Ya existe un rol con ese nombre');

    if (permissionIds && permissionIds.length > 0) {
      const perms = await prisma.permission.findMany({ where: { id: { in: permissionIds } } });
      if (perms.length !== permissionIds.length) {
        throw new AppError(400, 'Uno o más permisos no existen');
      }
    }

    return prisma.role.create({
      data: {
        ...rest,
        rolePermissions: permissionIds
          ? { create: permissionIds.map(permissionId => ({ permissionId })) }
          : undefined,
      },
      select: ROLE_SELECT,
    });
  }

  async getRoles() {
    return prisma.role.findMany({ orderBy: { name: 'asc' }, select: ROLE_SELECT });
  }

  async getRoleById(id: string) {
    const role = await prisma.role.findUnique({ where: { id }, select: ROLE_SELECT });
    if (!role) throw new AppError(404, 'Rol no encontrado');
    return role;
  }

  async updateRole(id: string, data: UpdateRoleDTO) {
    await this.getRoleById(id);
    const { permissionIds, ...rest } = data;

    if (rest.name) {
      const existing = await prisma.role.findFirst({ where: { name: rest.name, id: { not: id } } });
      if (existing) throw new AppError(409, 'Ya existe un rol con ese nombre');
    }

    if (permissionIds) {
      const perms = await prisma.permission.findMany({ where: { id: { in: permissionIds } } });
      if (perms.length !== permissionIds.length) {
        throw new AppError(400, 'Uno o más permisos no existen');
      }
    }

    return prisma.$transaction(async (tx) => {
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map(permissionId => ({ roleId: id, permissionId })),
          });
        }
      }
      return tx.role.update({ where: { id }, data: rest, select: ROLE_SELECT });
    });
  }

  async deleteRole(id: string) {
    await this.getRoleById(id);

    const usersCount = await prisma.userRole.count({ where: { roleId: id } });
    if (usersCount > 0) {
      throw new AppError(400, `No se puede eliminar. El rol tiene ${usersCount} usuario(s) asignado(s)`);
    }

    await prisma.role.delete({ where: { id } });
    return { message: 'Rol eliminado exitosamente' };
  }

  async assignPermissions(data: AssignPermissionsDTO) {
    await this.getRoleById(data.roleId);

    const perms = await prisma.permission.findMany({ where: { id: { in: data.permissionIds } } });
    if (perms.length !== data.permissionIds.length) {
      throw new AppError(400, 'Uno o más permisos no existen');
    }

    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: data.roleId } });
      if (data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map(permissionId => ({ roleId: data.roleId, permissionId })),
        });
      }
      return tx.role.findUnique({ where: { id: data.roleId }, select: ROLE_SELECT });
    });
  }
}
