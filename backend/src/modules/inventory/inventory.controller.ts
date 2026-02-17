import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { 
  getInventoryQuerySchema, 
  adjustInventorySchema, 
  openBoxSchema,
  stockRuleSchema,
  updateStockRuleSchema
} from './inventory.dto';
import { successResponse } from '../../utils/response';

const service = new InventoryService();

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getInventoryQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getInventoryByProductAndBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, branchId } = req.params;
    const inventory = await service.getByProductAndBranch(productId, branchId);
    res.json(successResponse(inventory));
  } catch (error) {
    next(error);
  }
};

export const adjustInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adjustInventorySchema.parse(req.body);
    const userId = (req as any).user.userId;
    const result = await service.adjust(data, userId);
    res.json(successResponse(result, 'Inventario ajustado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const openBox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = openBoxSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const result = await service.openBox(data, userId);
    res.json(successResponse(result, 'Cajas abiertas exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, branchId } = req.params;
    const result = await service.getMovements(productId, branchId, req.query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const createStockRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = stockRuleSchema.parse(req.body);
    const result = await service.createStockRule(data);
    res.status(201).json(successResponse(result, 'Regla de stock creada'));
  } catch (error) {
    next(error);
  }
};

export const updateStockRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, branchId } = req.params;
    const data = updateStockRuleSchema.parse(req.body);
    const result = await service.updateStockRule(productId, branchId, data);
    res.json(successResponse(result, 'Regla de stock actualizada'));
  } catch (error) {
    next(error);
  }
};

export const getStockAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getStockAlerts(req.query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
