import { Router } from 'express';
import * as controller from './customers.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Clientes (requieren autenticación)
router.get('/', authenticate, controller.getCustomers);
router.get('/:id', authenticate, controller.getCustomer);
router.post('/', authenticate, controller.createCustomer);
router.put('/:id', authenticate, controller.updateCustomer);
router.patch('/:id/toggle-active', authenticate, controller.toggleActive);
router.patch('/:id/toggle-block', authenticate, controller.toggleBlock);
router.patch('/:id/change-tier', authenticate, controller.changeTier);

// Direcciones
router.get('/:customerId/addresses', authenticate, controller.getAddresses);
router.post('/:customerId/addresses', authenticate, controller.createAddress);
router.put('/:customerId/addresses/:addressId', authenticate, controller.updateAddress);
router.delete('/:customerId/addresses/:addressId', authenticate, controller.deleteAddress);
router.patch('/:customerId/addresses/:addressId/set-default', authenticate, controller.setDefaultAddress);

export default router;
