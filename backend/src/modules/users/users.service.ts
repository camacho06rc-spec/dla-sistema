import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import {
  CreateUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
  ResetPasswordDTO,
  GetUsersQueryDTO,
} from './users.dto';

const USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: {
        select: { id: true, name: true, description: true },
      },
    },
  },
};

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(data: CreateUserDTO) {
    const { roleIds, password, ...rest } = data;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });
    if (existing) {
      throw new AppError(409, 'Ya existe un usuario con ese email o teléfono');
    }

    const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
    if (roles.length !== roleIds.length) {
      throw new AppError(400, 'Uno o más roles no existen');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        userRoles: {
          create: roleIds.map(roleId => ({ roleId })),
        },
      },
      select: USER_SELECT,
    });

    return user;
  }

  async getUsers(query: GetUsersQueryDTO) {
    const { page, limit, search, isActive, roleId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (roleId) {
      where.userRoles = { some: { roleId } };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: USER_SELECT }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    return user;
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    await this.getUserById(id);

    const { roleIds, ...rest } = data;

    if (rest.email || rest.phone) {
      const existing = await prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(rest.email ? [{ email: rest.email }] : []),
            ...(rest.phone ? [{ phone: rest.phone }] : []),
          ],
        },
      });
      if (existing) {
        throw new AppError(409, 'Ya existe un usuario con ese email o teléfono');
      }
    }

    if (roleIds) {
      const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
      if (roles.length !== roleIds.length) {
        throw new AppError(400, 'Uno o más roles no existen');
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      if (roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.createMany({ data: roleIds.map(roleId => ({ userId: id, roleId })) });
      }
      return tx.user.update({ where: { id }, data: rest, select: USER_SELECT });
    });

    return user;
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'Usuario desactivado exitosamente' };
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Usuario no encontrado');

    const isValid = await comparePassword(data.currentPassword, user.password);
    if (!isValid) throw new AppError(400, 'La contraseña actual es incorrecta');

    const hashedPassword = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async resetPassword(data: ResetPasswordDTO) {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError(404, 'Usuario no encontrado');

    const hashedPassword = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: data.userId }, data: { password: hashedPassword } });

    return { message: 'Contraseña reseteada exitosamente' };
  }

  async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: { id: true, name: true, module: true, action: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) throw new AppError(404, 'Usuario no encontrado');

    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission)
    );
    const unique = Array.from(new Map(permissions.map(p => [p.id, p])).values());

    return { userId, permissions: unique };
  }
}
