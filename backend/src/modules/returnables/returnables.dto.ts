import { z } from 'zod';

export const createReturnableEventSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['DELIVERED', 'RETURNED', 'CHARGED', 'FORGIVEN']),
  quantity: z.number().int().min(1),
  orderId: z.string().uuid().optional(),
  depositCharged: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateReturnableEventDTO = z.infer<typeof createReturnableEventSchema>;

export const getReturnablesLedgersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  hasPending: z.coerce.boolean().optional(),
});

export type GetReturnablesLedgersQueryDTO = z.infer<typeof getReturnablesLedgersQuerySchema>;

export const getReturnableEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  type: z.enum(['DELIVERED', 'RETURNED', 'CHARGED', 'FORGIVEN']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type GetReturnableEventsQueryDTO = z.infer<typeof getReturnableEventsQuerySchema>;

export const adjustLedgerSchema = z.object({
  customerId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(5),
  notes: z.string().optional(),
});

export type AdjustLedgerDTO = z.infer<typeof adjustLedgerSchema>;
