import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service';
import { 
  createProductSchema, 
  updateProductSchema, 
  updatePricesSchema,
  getProductsQuerySchema,
  addProductImageSchema
} from './products.dto';
import { successResponse } from '../../utils/response';
import { AuthRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';

const service = new ProductsService();

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getProductsQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await service.findById(req.params.id);
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError(401, 'Usuario no autenticado');
    }
    
    const product = await service.create(data, userId);
    res.status(201).json(successResponse(product, 'Producto creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await service.update(req.params.id, data);
    res.json(successResponse(product, 'Producto actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateProductPrices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updatePricesSchema.parse(req.body);
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError(401, 'Usuario no autenticado');
    }
    
    const prices = await service.updatePrices(req.params.id, data, userId);
    res.json(successResponse(prices, 'Precios actualizados exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const getProductPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await service.getPriceHistory(req.params.id);
    res.json(successResponse(history));
  } catch (error) {
    next(error);
  }
};

export const toggleProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await service.toggle(req.params.id);
    res.json(successResponse(product, 'Estado actualizado'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.delete(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const addProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addProductImageSchema.parse(req.body);
    const image = await service.addImage(req.params.id, data);
    res.status(201).json(successResponse(image, 'Imagen agregada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteImage(req.params.id, req.params.imageId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
