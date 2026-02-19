import { z } from 'zod';

// Crear gasto
export const createExpenseSchema = z.object({
  branchId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().min(0.01),
  description: z.string().min(3).max(500).optional(),
  receiptUrl: z.string().url().optional(),
  expenseDate: z.string().datetime().optional(),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;

// Actualizar gasto
export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.number().min(0.01).optional(),
  description: z.string().min(3).max(500).optional(),
  receiptUrl: z.string().url().optional(),
  expenseDate: z.string().datetime().optional(),
});

export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;

// Query para listar gastos
export const getExpensesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  branchId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export type GetExpensesQueryDTO = z.infer<typeof getExpensesQuerySchema>;
