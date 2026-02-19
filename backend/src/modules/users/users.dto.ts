import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

// Crear usuario
export const createUserSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  roleIds: z.array(z.string().uuid()).min(1),
  isActive: z.boolean().default(true),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

// Actualizar usuario
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// Cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).max(100),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

// Resetear contraseña
export const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(8).max(100),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

// Query usuarios
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  roleId: z.string().uuid().optional(),
});

export type GetUsersQueryDTO = z.infer<typeof getUsersQuerySchema>;

// Crear rol
export const createRoleSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;

// Actualizar rol
export const updateRoleSchema = createRoleSchema.partial();

export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;

// Asignar permisos
export const assignPermissionsSchema = z.object({
  roleId: z.string().uuid(),
  permissionIds: z.array(z.string().uuid()),
});

export type AssignPermissionsDTO = z.infer<typeof assignPermissionsSchema>;

// Crear permiso
export const createPermissionSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  module: z.string().min(2).max(50),
  action: z.string().min(2).max(50),
});

export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>;
