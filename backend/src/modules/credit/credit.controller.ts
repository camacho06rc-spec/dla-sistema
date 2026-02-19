import { Request, Response, NextFunction } from 'express';
import { CreditService } from './credit.service';
import {
  createCreditAccountSchema,
  updateCreditLimitSchema,
  registerPaymentSchema,
  getCreditAccountsQuerySchema,
  getCreditMovementsQuerySchema,
  getOverdueAccountsQuerySchema,
  creditAdjustmentSchema,
} from './credit.dto';
import { successResponse } from '../../utils/response';

const service = new CreditService();

export const createCreditAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCreditAccountSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const account = await service.createCreditAccount(data, userId);
    res.status(201).json(successResponse(account, 'Cuenta de crédito creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateCreditLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCreditLimitSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const account = await service.updateCreditLimit(req.params.customerId, data, userId);
    res.json(successResponse(account, 'Límite de crédito actualizado'));
  } catch (error) {
    next(error);
  }
};

export const registerPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerPaymentSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const movement = await service.registerPayment(data, userId);
    res.status(201).json(successResponse(movement, 'Pago registrado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getCreditAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getCreditAccountsQuerySchema.parse(req.query);
    const result = await service.getCreditAccounts(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getAccountByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await service.getAccountByCustomer(req.params.customerId);
    res.json(successResponse(account));
  } catch (error) {
    next(error);
  }
};

export const getCreditMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getCreditMovementsQuerySchema.parse(req.query);
    const result = await service.getCreditMovements(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getOverdueAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getOverdueAccountsQuerySchema.parse(req.query);
    const result = await service.getOverdueAccounts(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getPortfolioSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await service.getPortfolioSummary();
    res.json(successResponse(summary));
  } catch (error) {
    next(error);
  }
};

export const creditAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = creditAdjustmentSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const movement = await service.creditAdjustment(data, userId);
    res.status(201).json(successResponse(movement, 'Ajuste de crédito registrado'));
  } catch (error) {
    next(error);
  }
};
