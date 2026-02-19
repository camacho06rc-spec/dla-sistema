import { Request, Response, NextFunction } from 'express';
import { PurchasesService } from './purchases.service';
import {
  createPurchaseSchema,
  updatePurchaseStatusSchema,
  receivePurchaseSchema,
  registerPaymentSchema,
  cancelPurchaseSchema,
  purchasesQuerySchema,
} from './purchases.dto';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../types';

const service = new PurchasesService();

export const getPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = purchasesQuerySchema.parse(req.query);
    const result = await service.getAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchase = await service.getById(req.params.id);
    res.json(successResponse(purchase));
  } catch (error) {
    next(error);
  }
};

export const createPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPurchaseSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;
    const purchase = await service.create(data, userId);
    res.status(201).json(successResponse(purchase, 'Compra creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updatePurchaseStatusSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;
    const purchase = await service.updateStatus(req.params.id, data, userId);
    res.json(successResponse(purchase, 'Estado de compra actualizado'));
  } catch (error) {
    next(error);
  }
};

export const receivePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = receivePurchaseSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;
    const purchase = await service.receive(req.params.id, data, userId);
    res.json(successResponse(purchase, 'Compra recibida e inventario actualizado'));
  } catch (error) {
    next(error);
  }
};

export const registerPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerPaymentSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;
    const purchase = await service.registerPayment(req.params.id, data, userId);
    res.json(successResponse(purchase, 'Pago registrado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const cancelPurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = cancelPurchaseSchema.parse(req.body);
    const userId = (req as AuthRequest).user!.userId;
    const purchase = await service.cancel(req.params.id, reason, userId);
    res.json(successResponse(purchase, 'Compra cancelada'));
  } catch (error) {
    next(error);
  }
};

export const getPurchasesBySupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const purchases = await service.getBySupplier(req.params.supplierId);
    res.json(successResponse(purchases));
  } catch (error) {
    next(error);
  }
};

export const getProductPurchaseHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await service.getProductHistory(req.params.productId);
    res.json(successResponse(history));
  } catch (error) {
    next(error);
  }
};
