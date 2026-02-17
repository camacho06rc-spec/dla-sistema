import { z } from 'zod';
import { InventoryMovementType } from '@prisma/client';

export const getInventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  lowStock: z.coerce.boolean().optional()
});

export const adjustInventorySchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid(),
  type: z.nativeEnum(InventoryMovementType),
  boxesDelta: z.number().int().default(0),
  piecesDelta: z.number().int().default(0),
  reason: z.string().min(3),
  referenceId: z.string().optional()
}).refine(data => data.boxesDelta !== 0 || data.piecesDelta !== 0, {
  message: "Debe especificar al menos un cambio en cajas o piezas"
});

export const openBoxSchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid(),
  boxes: z.number().int().positive()
});

export const stockRuleSchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid(),
  minBoxes: z.number().int().min(0).default(0),
  minPieces: z.number().int().min(0).default(0)
}).refine(data => data.minBoxes > 0 || data.minPieces > 0, {
  message: "Debe establecer un mínimo de cajas o piezas"
});

export const updateStockRuleSchema = z.object({
  minBoxes: z.number().int().min(0).optional(),
  minPieces: z.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});
