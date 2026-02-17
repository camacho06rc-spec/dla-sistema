import { Request, Response, NextFunction } from 'express';
import { BrandsService } from './brands.service';
import { createBrandSchema, updateBrandSchema, getBrandsQuerySchema } from './brands.dto';
import { successResponse } from '../../utils/response';

const service = new BrandsService();

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getBrandsQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await service.findById(req.params.id);
    res.json(successResponse(brand));
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBrandSchema.parse(req.body);
    const brand = await service.create(data);
    res.status(201).json(successResponse(brand, 'Marca creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateBrandSchema.parse(req.body);
    const brand = await service.update(req.params.id, data);
    res.json(successResponse(brand, 'Marca actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const toggleBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brand = await service.toggle(req.params.id);
    res.json(successResponse(brand, 'Estado actualizado'));
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.delete(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
