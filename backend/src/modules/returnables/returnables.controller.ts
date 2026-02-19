import { Request, Response, NextFunction } from 'express';
import { ReturnablesService } from './returnables.service';
import {
  createReturnableEventSchema,
  getReturnablesLedgersQuerySchema,
  getReturnableEventsQuerySchema,
  adjustLedgerSchema,
} from './returnables.dto';
import { successResponse } from '../../utils/response';

const service = new ReturnablesService();

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createReturnableEventSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const event = await service.createEvent(data, userId);
    res.status(201).json(successResponse(event, 'Evento de retornables registrado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getLedgers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getReturnablesLedgersQuerySchema.parse(req.query);
    const ledgers = await service.getLedgers(query);
    res.json(successResponse(ledgers));
  } catch (error) {
    next(error);
  }
};

export const getLedgerByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const ledger = await service.getLedgerByCustomer(customerId);
    res.json(successResponse(ledger));
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getReturnableEventsQuerySchema.parse(req.query);
    const events = await service.getEvents(query);
    res.json(successResponse(events));
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await service.getSummary();
    res.json(successResponse(summary));
  } catch (error) {
    next(error);
  }
};

export const adjustLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adjustLedgerSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const adjustment = await service.adjustLedger(data, userId);
    res.json(successResponse(adjustment, 'Ajuste de ledger realizado exitosamente'));
  } catch (error) {
    next(error);
  }
};
