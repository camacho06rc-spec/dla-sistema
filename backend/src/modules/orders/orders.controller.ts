import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service';
import { 
  createOrderSchema, 
  updateOrderStatusSchema, 
  getOrdersQuerySchema 
} from './orders.dto';
import { successResponse } from '../../utils/response';

const service = new OrdersService();

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getOrdersQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await service.findById(req.params.id);
    res.json(successResponse(order));
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const order = await service.create(data, userId);
    res.status(201).json(successResponse(order, 'Pedido creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateOrderStatusSchema.parse(req.body);
    const userId = (req as any).user.userId;
    const order = await service.updateStatus(req.params.id, data, userId);
    res.json(successResponse(order, 'Estado del pedido actualizado'));
  } catch (error) {
    next(error);
  }
};
