import { Request, Response, NextFunction } from 'express';
import { DeliveriesService } from './deliveries.service';
import {
  assignDeliverySchema,
  createRouteSchema,
  updateDeliveryStatusSchema,
  updateLocationSchema,
  getDeliveriesQuerySchema,
  getRoutesQuerySchema,
  getPerformanceQuerySchema,
} from './deliveries.dto';
import { successResponse } from '../../utils/response';

const service = new DeliveriesService();

export const assignDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = assignDeliverySchema.parse(req.body);
    const userId = (req as any).user.userId;
    const delivery = await service.assignDelivery(data, userId);
    res.status(201).json(successResponse(delivery, 'Entrega asignada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createRouteSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const route = await service.createRoute(data, userId);
    res.status(201).json(successResponse(route, 'Ruta creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateDeliveryStatusSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const delivery = await service.updateDeliveryStatus(req.params.id, data, userId);
    res.json(successResponse(delivery, 'Estado de entrega actualizado'));
  } catch (error) {
    next(error);
  }
};

export const updateDriverLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateLocationSchema.parse(req.body);
    const location = await service.updateDriverLocation(req.params.id, data);
    res.json(successResponse(location, 'Ubicación actualizada'));
  } catch (error) {
    next(error);
  }
};

export const getDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getDeliveriesQuerySchema.parse(req.query);
    const result = await service.getDeliveries(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const delivery = await service.getDeliveryById(req.params.id);
    res.json(successResponse(delivery));
  } catch (error) {
    next(error);
  }
};

export const getRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getRoutesQuerySchema.parse(req.query);
    const result = await service.getRoutes(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getRouteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const route = await service.getRouteById(req.params.id);
    res.json(successResponse(route));
  } catch (error) {
    next(error);
  }
};

export const getDriverPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getPerformanceQuerySchema.parse(req.query);
    const result = await service.getDriverPerformance(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
