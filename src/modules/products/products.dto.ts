import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string().min(2).max(200),
    sku: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid(),
    mainImageUrl: z.string().url().optional(),

    // Retornables
    isReturnable: z.boolean().default(false),
    containersPerBox: z.number().int().positive().optional(),
    depositPerContainer: z.number().positive().optional(),

    // Unidades
    piecesPerBox: z.number().int().positive().default(1),

    // Puntos
    grantsPoints: z.boolean().default(true),

    // Precios (IVA incluido)
    prices: z.object({
      priceEventual: z.number().positive(),
      priceFrecuente: z.number().positive(),
      priceVip: z.number().positive(),
    }),
  })
  .refine(
    (data) => {
      // Si es retornable, debe tener containersPerBox y depositPerContainer
      if (data.isReturnable) {
        return data.containersPerBox && data.depositPerContainer;
      }
      return true;
    },
    {
      message:
        'Los productos retornables deben tener envases por caja y depósito',
    }
  );

export const updateProductSchema = createProductSchema
  .partial()
  .omit({ prices: true });

export const updateProductPricesSchema = z.object({
  priceEventual: z.number().positive(),
  priceFrecuente: z.number().positive(),
  priceVip: z.number().positive(),
  reason: z.string().optional(),
});

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  isReturnable: z.coerce.boolean().optional(),
});

export const addProductImageSchema = z.object({
  imageUrl: z.string().url(),
  order: z.number().int().default(0),
});

export const updateImageOrderSchema = z.object({
  order: z.number().int().min(0),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type UpdateProductPricesDTO = z.infer<typeof updateProductPricesSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
export type AddProductImageDTO = z.infer<typeof addProductImageSchema>;
export type UpdateImageOrderDTO = z.infer<typeof updateImageOrderSchema>;
