import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service';
import { 
  createCustomerSchema, 
  updateCustomerSchema, 
  getCustomersQuerySchema,
  createAddressSchema,
  updateAddressSchema,
  changeTierSchema
} from './customers.dto';
import { successResponse } from '../../utils/response';

const service = new CustomersService();

// ========== CUSTOMERS ==========

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = getCustomersQuerySchema.parse(req.query);
    const result = await service.findAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await service.findById(req.params.id);
    res.json(successResponse(customer));
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCustomerSchema.parse(req.body);
    const customer = await service.create(data);
    res.status(201).json(successResponse(customer, 'Cliente creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCustomerSchema.parse(req.body);
    const customer = await service.update(req.params.id, data);
    res.json(successResponse(customer, 'Cliente actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await service.toggleActive(req.params.id);
    res.json(successResponse(customer, 'Estado del cliente actualizado'));
  } catch (error) {
    next(error);
  }
};

export const toggleBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await service.toggleBlock(req.params.id);
    res.json(successResponse(customer, customer.isBlocked ? 'Cliente bloqueado' : 'Cliente desbloqueado'));
  } catch (error) {
    next(error);
  }
};

export const changeTier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier } = changeTierSchema.parse(req.body);
    const customer = await service.changeTier(req.params.id, tier);
    res.json(successResponse(customer, 'Tier del cliente actualizado'));
  } catch (error) {
    next(error);
  }
};

// ========== ADDRESSES ==========

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await service.getAddresses(req.params.customerId);
    res.json(successResponse(addresses));
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createAddressSchema.parse({
      ...req.body,
      customerId: req.params.customerId
    });
    const address = await service.createAddress(data);
    res.status(201).json(successResponse(address, 'Dirección creada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateAddressSchema.parse(req.body);
    const address = await service.updateAddress(req.params.addressId, data);
    res.json(successResponse(address, 'Dirección actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteAddress(req.params.addressId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await service.setDefaultAddress(req.params.addressId);
    res.json(successResponse(address, 'Dirección marcada como principal'));
  } catch (error) {
    next(error);
  }
};
