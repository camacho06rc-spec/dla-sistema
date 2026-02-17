import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(1).max(50),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  isReturnable: z.boolean().default(false),
  containersPerBox: z.number().int().positive().optional(),
  depositPerContainer: z.number().positive().optional(),
  piecesPerBox: z.number().int().positive().optional(),
  grantsPoints: z.boolean().default(false),
  mainImageUrl: z.string().url().optional(),
  prices: z.object({
    priceEventual: z.number().positive(),
    priceFrecuente: z.number().positive(),
    priceVip: z.number().positive()
  })
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isReturnable: z.boolean().optional(),
  containersPerBox: z.number().int().positive().optional(),
  depositPerContainer: z.number().positive().optional(),
  piecesPerBox: z.number().int().positive().optional(),
  grantsPoints: z.boolean().optional(),
  mainImageUrl: z.string().url().optional()
});

export const updatePricesSchema = z.object({
  priceEventual: z.number().positive(),
  priceFrecuente: z.number().positive(),
  priceVip: z.number().positive(),
  reason: z.string().optional()
});

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  isReturnable: z.coerce.boolean().optional(),
  grantsPoints: z.coerce.boolean().optional()
});

export const addProductImageSchema = z.object({
  imageUrl: z.string().url(),
  order: z.number().int().default(0)
});
