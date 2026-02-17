import { z } from 'zod';

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  imageUrl: z.string().url().optional(),
});

export const updateBrandSchema = createBrandSchema.partial();

export const getBrandsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateBrandDTO = z.infer<typeof createBrandSchema>;
export type UpdateBrandDTO = z.infer<typeof updateBrandSchema>;
export type GetBrandsQuery = z.infer<typeof getBrandsQuerySchema>;
