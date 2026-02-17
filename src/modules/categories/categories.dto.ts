import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  imageUrl: z.string().url().optional(),
  order: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const getCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
