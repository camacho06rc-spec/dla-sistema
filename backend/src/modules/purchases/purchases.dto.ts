import { z } from 'zod';

// Create Purchase Item
export const createPurchaseItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  boxes: z.number().int().min(0).default(0),
  pieces: z.number().int().min(0).default(0),
  unitCost: z.number().min(0, 'Unit cost must be positive'),
}).refine(
  (data) => data.boxes > 0 || data.pieces > 0,
  { message: 'At least boxes or pieces must be greater than 0' }
);

export type CreatePurchaseItemDTO = z.infer<typeof createPurchaseItemSchema>;

// Create Purchase
export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  branchId: z.string().uuid('Invalid branch ID'),
  expectedDate: z.string().datetime().optional(),
  items: z.array(createPurchaseItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0).default(0),
  shipping: z.number().min(0).default(0),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().datetime().optional(),
});

export type CreatePurchaseDTO = z.infer<typeof createPurchaseSchema>;

// Update Purchase Status
export const updatePurchaseStatusSchema = z.object({
  status: z.enum(['PENDING', 'RECEIVED', 'PAID', 'CANCELLED']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdatePurchaseStatusDTO = z.infer<typeof updatePurchaseStatusSchema>;

// Receive Purchase
export const receivePurchaseSchema = z.object({
  receivedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type ReceivePurchaseDTO = z.infer<typeof receivePurchaseSchema>;

// Register Payment
export const registerPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  notes: z.string().optional(),
});

export type RegisterPaymentDTO = z.infer<typeof registerPaymentSchema>;

// Cancel Purchase
export const cancelPurchaseSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

export type CancelPurchaseDTO = z.infer<typeof cancelPurchaseSchema>;

// Query filters
export const purchasesQuerySchema = z.object({
  search: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'RECEIVED', 'PAID', 'CANCELLED']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export type PurchasesQueryDTO = z.infer<typeof purchasesQuerySchema>;
