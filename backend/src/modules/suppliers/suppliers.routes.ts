import { Router } from 'express';
import * as controller from './suppliers.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// ==========================================
// SUPPLIERS ROUTES
// ==========================================

router.get('/', authenticate, controller.getSuppliers);
router.get('/:id', authenticate, controller.getSupplier);
router.post('/', authenticate, controller.createSupplier);
router.put('/:id', authenticate, controller.updateSupplier);
router.patch('/:id/toggle-active', authenticate, controller.toggleSupplierActive);
router.patch('/:id/toggle-block', authenticate, controller.toggleSupplierBlock);
router.delete('/:id', authenticate, controller.deleteSupplier);

// ==========================================
// CONTACTS ROUTES
// ==========================================

router.get('/:id/contacts', authenticate, controller.getContacts);
router.post('/:id/contacts', authenticate, controller.createContact);
router.put('/:id/contacts/:contactId', authenticate, controller.updateContact);
router.delete('/:id/contacts/:contactId', authenticate, controller.deleteContact);

// ==========================================
// PRODUCTS ROUTES
// ==========================================

router.get('/:id/products', authenticate, controller.getSupplierProducts);
router.post('/:id/products', authenticate, controller.addSupplierProduct);
router.put('/:id/products/:productId', authenticate, controller.updateSupplierProduct);
router.delete('/:id/products/:productId', authenticate, controller.removeSupplierProduct);

export default router;
