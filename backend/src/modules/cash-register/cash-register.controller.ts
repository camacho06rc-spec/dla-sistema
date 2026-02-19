import { Request, Response, NextFunction } from 'express';
import { CashRegisterService } from './cash-register.service';
import { openSessionSchema, closeSessionSchema, getSessionsQuerySchema } from './cash-register.dto';
import { successResponse } from '../../utils/response';

const service = new CashRegisterService();

export const openSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = openSessionSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const session = await service.openSession(data, userId);
    res.status(201).json(successResponse(session, 'Sesión de caja abierta exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const closeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = closeSessionSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const session = await service.closeSession(req.params.id, data, userId);
    res.json(successResponse(session, 'Sesión de caja cerrada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getSessionsQuerySchema.parse(req.query);
    const result = await service.getSessions(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await service.getSessionById(req.params.id);
    res.json(successResponse(session));
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const session = await service.getActiveSession(userId);
    res.json(successResponse(session));
  } catch (error) {
    next(error);
  }
};

export const getSessionsByBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId } = req.params;
    const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
    const sessions = await service.getSessionsByBranch(branchId, fromDate, toDate);
    res.json(successResponse(sessions));
  } catch (error) {
    next(error);
  }
};

export const getSessionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await service.getSessionStats(req.params.id);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
};
