import { z } from 'zod';
import { LoyaltyMovementType } from '@prisma/client';

// Crear regla de lealtad
export const createLoyaltyRuleSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  spendAmount: z.number().min(0),
  pointsEarned: z.number().int().min(1),
  pointsRequired: z.number().int().min(1).optional(),
  rewardValue: z.number().min(0).optional(),
  expirationDays: z.number().int().min(1).default(365),
  isActive: z.boolean().default(true),
});

export type CreateLoyaltyRuleDTO = z.infer<typeof createLoyaltyRuleSchema>;

// Actualizar regla
export const updateLoyaltyRuleSchema = createLoyaltyRuleSchema.partial();

export type UpdateLoyaltyRuleDTO = z.infer<typeof updateLoyaltyRuleSchema>;

// Query para listar reglas
export const getLoyaltyRulesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z.coerce.boolean().optional(),
});

export type GetLoyaltyRulesQueryDTO = z.infer<typeof getLoyaltyRulesQuerySchema>;

// Registrar movimiento de puntos
export const createLoyaltyMovementSchema = z.object({
  customerId: z.string().uuid(),
  type: z.nativeEnum(LoyaltyMovementType),
  points: z.number().int(),
  orderId: z.string().uuid().optional(),
  notes: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateLoyaltyMovementDTO = z.infer<typeof createLoyaltyMovementSchema>;

// Canjear puntos
export const redeemPointsSchema = z.object({
  customerId: z.string().uuid(),
  points: z.number().int().min(1),
  ruleId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type RedeemPointsDTO = z.infer<typeof redeemPointsSchema>;

// Ajustar puntos manualmente
export const adjustPointsSchema = z.object({
  customerId: z.string().uuid(),
  points: z.number().int(),
  reason: z.string().min(5),
  notes: z.string().optional(),
});

export type AdjustPointsDTO = z.infer<typeof adjustPointsSchema>;

// Query para movimientos
export const getLoyaltyMovementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  type: z.nativeEnum(LoyaltyMovementType).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type GetLoyaltyMovementsQueryDTO = z.infer<typeof getLoyaltyMovementsQuerySchema>;
