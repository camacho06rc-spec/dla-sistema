import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { BrandsService } from './brands.service';
import { successResponse } from '../../utils/responses';
import {
  createBrandSchema,
  updateBrandSchema,
  getBrandsQuerySchema,
} from './brands.dto';

const brandsService = new BrandsService();

export class BrandsController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = getBrandsQuerySchema.parse(req.query);
      const result = await brandsService.findAll(query);
      return successResponse(res, result, 'Marcas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await brandsService.findById(id);
      return successResponse(res, brand, 'Marca obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBrandSchema.parse(req.body);
      const brand = await brandsService.create(data, req.user!.id);
      return successResponse(res, brand, 'Marca creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateBrandSchema.parse(req.body);
      const brand = await brandsService.update(id, data, req.user!.id);
      return successResponse(res, brand, 'Marca actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const brand = await brandsService.toggle(id, req.user!.id);
      return successResponse(
        res,
        brand,
        'Estado de marca actualizado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await brandsService.delete(id, req.user!.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}
