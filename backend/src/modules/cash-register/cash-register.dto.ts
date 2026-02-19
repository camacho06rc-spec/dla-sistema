import { z } from 'zod';

// Abrir sesión de caja
export const openSessionSchema = z.object({
  branchId: z.string().uuid(),
  initialCash: z.number().min(0),
  notes: z.string().optional(),
});

export type OpenSessionDTO = z.infer<typeof openSessionSchema>;

// Cerrar sesión de caja
export const closeSessionSchema = z.object({
  finalCash: z.number().min(0),
  notes: z.string().optional(),
});

export type CloseSessionDTO = z.infer<typeof closeSessionSchema>;

// Query para listar sesiones
export const getSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  branchId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  isOpen: z.coerce.boolean().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type GetSessionsQueryDTO = z.infer<typeof getSessionsQuerySchema>;
