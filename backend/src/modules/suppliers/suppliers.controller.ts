import { Request, Response, NextFunction } from 'express';
import { SuppliersService } from './suppliers.service';
import {
  createSupplierSchema,
  updateSupplierSchema,
  toggleBlockSupplierSchema,
  createContactSchema,
  updateContactSchema,
  addProductSchema,
  updateSupplierProductSchema,
  suppliersQuerySchema,
} from './suppliers.dto';
import { successResponse } from '../../utils/response';

const service = new SuppliersService();

// ==========================================
// SUPPLIERS
// ==========================================

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = suppliersQuerySchema.parse(req.query);
    const result = await service.getAll(query);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await service.getById(req.params.id);
    res.json(successResponse(supplier));
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSupplierSchema.parse(req.body);
    const supplier = await service.create(data);
    res.status(201).json(successResponse(supplier, 'Proveedor creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSupplierSchema.parse(req.body);
    const supplier = await service.update(req.params.id, data);
    res.json(successResponse(supplier, 'Proveedor actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const toggleSupplierActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supplier = await service.toggleActive(req.params.id);
    res.json(successResponse(supplier, 'Estado del proveedor actualizado'));
  } catch (error) {
    next(error);
  }
};

export const toggleSupplierBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = toggleBlockSupplierSchema.parse(req.body);
    const supplier = await service.toggleBlock(req.params.id, data);
    res.json(successResponse(supplier, supplier.isBlocked ? 'Proveedor bloqueado' : 'Proveedor desbloqueado'));
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.delete(req.params.id);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONTACTS
// ==========================================

export const getContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await service.getContacts(req.params.id);
    res.json(successResponse(contacts));
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createContactSchema.parse(req.body);
    const contact = await service.createContact(req.params.id, data);
    res.status(201).json(successResponse(contact, 'Contacto creado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateContactSchema.parse(req.body);
    const contact = await service.updateContact(req.params.id, req.params.contactId, data);
    res.json(successResponse(contact, 'Contacto actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.deleteContact(req.params.id, req.params.contactId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PRODUCTS
// ==========================================

export const getSupplierProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await service.getProducts(req.params.id);
    res.json(successResponse(products));
  } catch (error) {
    next(error);
  }
};

export const addSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = addProductSchema.parse(req.body);
    const product = await service.addProduct(req.params.id, data);
    res.status(201).json(successResponse(product, 'Producto agregado al proveedor exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const updateSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSupplierProductSchema.parse(req.body);
    const product = await service.updateSupplierProduct(req.params.id, req.params.productId, data);
    res.json(successResponse(product, 'Producto del proveedor actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
};

export const removeSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.removeProduct(req.params.id, req.params.productId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};
