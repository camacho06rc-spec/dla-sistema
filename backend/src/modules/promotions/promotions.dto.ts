import { z } from 'zod';
import { PromotionType } from '@prisma/client';

const createPromotionBaseSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.nativeEnum(PromotionType),
  code: z.string().min(3).max(20).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  applicableToTiers: z.array(z.enum(['EVENTUAL', 'FRECUENTE', 'VIP'])).optional(),
  applicableProductIds: z.array(z.string().uuid()).optional(),
  applicableCategoryIds: z.array(z.string().uuid()).optional(),
  buyQuantity: z.number().int().min(1).optional(),
  getQuantity: z.number().int().min(1).optional(),
  maxUsesPerCustomer: z.number().int().min(1).optional(),
  maxTotalUses: z.number().int().min(1).optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const createPromotionSchema = createPromotionBaseSchema.refine(
  (data) => new Date(data.validFrom) < new Date(data.validTo),
  { message: 'validFrom debe ser anterior a validTo' }
);

export type CreatePromotionDTO = z.infer<typeof createPromotionSchema>;

export const updatePromotionSchema = createPromotionBaseSchema.partial().extend({
  id: z.string().uuid().optional(),
}).refine(
  (data) => !data.validFrom || !data.validTo || new Date(data.validFrom) < new Date(data.validTo),
  { message: 'validFrom debe ser anterior a validTo' }
);

export type UpdatePromotionDTO = z.infer<typeof updatePromotionSchema>;

export const getPromotionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.nativeEnum(PromotionType).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export type GetPromotionsQueryDTO = z.infer<typeof getPromotionsQuerySchema>;

export const validatePromotionSchema = z.object({
  promotionId: z.string().uuid().optional(),
  code: z.string().optional(),
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
  })).min(1),
}).refine(
  (data) => data.promotionId || data.code,
  { message: 'Debe proporcionar promotionId o code' }
);

export type ValidatePromotionDTO = z.infer<typeof validatePromotionSchema>;

export const applyPromotionSchema = z.object({
  orderId: z.string().uuid(),
  promotionId: z.string().uuid().optional(),
  code: z.string().optional(),
}).refine(
  (data) => data.promotionId || data.code,
  { message: 'Debe proporcionar promotionId o code' }
);

export type ApplyPromotionDTO = z.infer<typeof applyPromotionSchema>;
