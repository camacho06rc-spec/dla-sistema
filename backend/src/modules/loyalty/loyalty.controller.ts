import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './loyalty.service';
import {
  createLoyaltyRuleSchema,
  updateLoyaltyRuleSchema,
  getLoyaltyRulesQuerySchema,
  redeemPointsSchema,
  adjustPointsSchema,
  getLoyaltyMovementsQuerySchema,
} from './loyalty.dto';
import { successResponse } from '../../utils/response';

const service = new LoyaltyService();

// RULES
export const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createLoyaltyRuleSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const rule = await service.createRule(data, userId);
    res.status(201).json(successResponse(rule, 'Regla creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updateLoyaltyRuleSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const rule = await service.updateRule(id, data, userId);
    res.json(successResponse(rule, 'Regla actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getLoyaltyRulesQuerySchema.parse(req.query);
    const rules = await service.getRules(query);
    res.json(successResponse(rules));
  } catch (error) {
    next(error);
  }
};

export const getRuleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const rule = await service.getRuleById(id);
    res.json(successResponse(rule));
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await service.deleteRule(id);
    res.json(successResponse(result, 'Regla eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
};

// WALLETS
export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const wallet = await service.getWalletByCustomer(customerId);
    res.json(successResponse(wallet));
  } catch (error) {
    next(error);
  }
};

// REDEEM
export const redeemPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = redeemPointsSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const result = await service.redeemPoints(data, userId);
    res.json(successResponse(result, 'Puntos canjeados exitosamente'));
  } catch (error) {
    next(error);
  }
};

// ADJUST
export const adjustPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adjustPointsSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const result = await service.adjustPoints(data, userId);
    res.json(successResponse(result, 'Puntos ajustados exitosamente'));
  } catch (error) {
    next(error);
  }
};

// EXPIRE
export const expirePoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.expirePoints();
    res.json(successResponse(result, 'Puntos expirados procesados exitosamente'));
  } catch (error) {
    next(error);
  }
};

// MOVEMENTS
export const getMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getLoyaltyMovementsQuerySchema.parse(req.query);
    const movements = await service.getMovements(query);
    res.json(successResponse(movements));
  } catch (error) {
    next(error);
  }
};

// STATS
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await service.getStats();
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};

// TOP CUSTOMERS
export const getTopCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawLimit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);
    const customers = await service.getTopCustomers(limit);
    res.json(successResponse(customers));
  } catch (error) {
    next(error);
  }
};
