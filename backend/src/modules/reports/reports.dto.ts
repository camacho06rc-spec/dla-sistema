import { z } from 'zod';

// Date range query
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['today', 'week', 'month', 'year', 'custom']).optional().default('month'),
});

export type DateRangeDTO = z.infer<typeof dateRangeSchema>;

// Sales report query
export const salesReportSchema = dateRangeSchema.extend({
  branchId: z.string().uuid().optional(),
});

export type SalesReportDTO = z.infer<typeof salesReportSchema>;

// Top products query
export const topProductsSchema = dateRangeSchema.extend({
  limit: z.string().optional().default('10'),
  orderBy: z.enum(['quantity', 'revenue']).optional().default('revenue'),
});

export type TopProductsDTO = z.infer<typeof topProductsSchema>;

// Top customers query
export const topCustomersSchema = dateRangeSchema.extend({
  limit: z.string().optional().default('10'),
  orderBy: z.enum(['total', 'frequency']).optional().default('total'),
});

export type TopCustomersDTO = z.infer<typeof topCustomersSchema>;

// Inventory status query
export const inventoryStatusSchema = z.object({
  branchId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  lowStockOnly: z.enum(['true', 'false']).optional(),
});

export type InventoryStatusDTO = z.infer<typeof inventoryStatusSchema>;

// Profit margin query
export const profitMarginSchema = dateRangeSchema.extend({
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

export type ProfitMarginDTO = z.infer<typeof profitMarginSchema>;

// Purchases summary query
export const purchasesSummarySchema = dateRangeSchema.extend({
  supplierId: z.string().uuid().optional(),
});

export type PurchasesSummaryDTO = z.infer<typeof purchasesSummarySchema>;

// Dashboard query
export const dashboardSchema = z.object({
  branchId: z.string().uuid().optional(),
});

export type DashboardDTO = z.infer<typeof dashboardSchema>;
