import { z } from 'zod';
import { CreditMovementType, CreditTerm } from '@prisma/client';

export const createCreditAccountSchema = z.object({
  customerId: z.string().uuid(),
  creditLimit: z.number().positive(),
  isActive: z.boolean().optional().default(true),
});

export const updateCreditLimitSchema = z.object({
  creditLimit: z.number().positive(),
});

export const registerPaymentSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'CHECK', 'CARD']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  applyToOrders: z.array(z.string().uuid()).optional(),
});

export const getCreditAccountsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  hasDebt: z.coerce.boolean().optional(),
});

export const getCreditMovementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  type: z.nativeEnum(CreditMovementType).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const getOverdueAccountsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  term: z.nativeEnum(CreditTerm).optional(),
});

export const creditAdjustmentSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});
