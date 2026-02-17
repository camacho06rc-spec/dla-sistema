import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service';
import { createCategorySchema, updateCategorySchema, getCategoriesQuerySchema } from './categories.dto';
import { successResponse } from '../../utils/response';

const service = new CategoriesService();

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getCategoriesQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.findById(req.params.id);
    res.json(successResponse(category));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await service.create(data);
    res.status(201).json(successResponse(category, 'Categoría creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await service.update(req.params.id, data);
    res.json(successResponse(category, 'Categoría actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const toggleCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await service.toggle(req.params.id);
    res.json(successResponse(category, 'Estado actualizado'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.delete(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
