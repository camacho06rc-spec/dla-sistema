import { Request, Response, NextFunction } from 'express';
import { PromotionsService } from './promotions.service';
import {
  createPromotionSchema,
  updatePromotionSchema,
  getPromotionsQuerySchema,
  validatePromotionSchema,
} from './promotions.dto';
import { successResponse } from '../../utils/response';

const service = new PromotionsService();

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPromotionSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const promotion = await service.create(data, userId);
    res.status(201).json(successResponse(promotion, 'Promoción creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updatePromotionSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    const promotion = await service.update(id, data, userId);
    res.json(successResponse(promotion, 'Promoción actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const findAllPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getPromotionsQuerySchema.parse(req.query);
    const promotions = await service.findAll(query);
    res.json(successResponse(promotions));
  } catch (error) {
    next(error);
  }
};

export const findPromotionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const promotion = await service.findById(id);
    res.json(successResponse(promotion));
  } catch (error) {
    next(error);
  }
};

export const getActivePromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotions = await service.getActivePromotions();
    res.json(successResponse(promotions));
  } catch (error) {
    next(error);
  }
};

export const validatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = validatePromotionSchema.parse(req.body);
    const result = await service.validatePromotion(data);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await service.delete(id);
    res.json(successResponse(result, 'Promoción eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getPromotionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const stats = await service.getStats(id);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};
