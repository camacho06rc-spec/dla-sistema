import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/authenticate';
import { CategoriesService } from './categories.service';
import { successResponse } from '../../utils/responses';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoriesQuerySchema,
} from './categories.dto';

const categoriesService = new CategoriesService();

export class CategoriesController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = getCategoriesQuerySchema.parse(req.query);
      const result = await categoriesService.findAll(query);
      return successResponse(res, result, 'Categorías obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.findById(id);
      return successResponse(res, category, 'Categoría obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await categoriesService.create(data, req.user!.id);
      return successResponse(
        res,
        category,
        'Categoría creada exitosamente',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCategorySchema.parse(req.body);
      const category = await categoriesService.update(id, data, req.user!.id);
      return successResponse(
        res,
        category,
        'Categoría actualizada exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.toggle(id, req.user!.id);
      return successResponse(
        res,
        category,
        'Estado de categoría actualizado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriesService.delete(id, req.user!.id);
      return successResponse(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}
