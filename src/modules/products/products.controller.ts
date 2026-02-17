import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { ProductsService } from './products.service';
import { successResponse } from '../../utils/responses';
import {
  validateCreateProduct,
  updateProductSchema,
  updateProductPricesSchema,
  getProductsQuerySchema,
  addProductImageSchema,
  updateImageOrderSchema,
} from './products.dto';

const productsService = new ProductsService();

export class ProductsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = getProductsQuerySchema.parse(req.query);
      const result = await productsService.findAll(query);
      return successResponse(res, result, 'Productos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.findById(id);
      return successResponse(res, product, 'Producto obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = validateCreateProduct(req.body);
      const product = await productsService.create(data, req.user!.id);
      return successResponse(
        res,
        product,
        'Producto creado exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProductSchema.parse(req.body);
      const product = await productsService.update(id, data, req.user!.id);
      return successResponse(
        res,
        product,
        'Producto actualizado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productsService.toggle(id, req.user!.id);
      return successResponse(
        res,
        product,
        'Estado de producto actualizado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await productsService.delete(id, req.user!.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async updatePrices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProductPricesSchema.parse(req.body);
      const product = await productsService.updatePrices(
        id,
        data,
        req.user!.id
      );
      return successResponse(
        res,
        product,
        'Precios actualizados exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async getPriceHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await productsService.getPriceHistory(id);
      return successResponse(
        res,
        history,
        'Historial de precios obtenido exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async addImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = addProductImageSchema.parse(req.body);
      const image = await productsService.addImage(id, data, req.user!.id);
      return successResponse(
        res,
        image,
        'Imagen agregada exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, imageId } = req.params;
      const result = await productsService.deleteImage(
        id,
        imageId,
        req.user!.id
      );
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async updateImageOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, imageId } = req.params;
      const data = updateImageOrderSchema.parse(req.body);
      const image = await productsService.updateImageOrder(
        id,
        imageId,
        data
      );
      return successResponse(
        res,
        image,
        'Orden de imagen actualizado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }
}
