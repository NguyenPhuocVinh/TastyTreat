import { deliveryController } from '../controllers/delivery.controller.js';
import { authControllers } from '../controllers/auth.controller.js';
import { authenticateAccessToken } from '../middlewares/auth.middlewares.js';
import { ROLE_LIST, checkPermissions } from '../middlewares/permission.middleware.js';
import express from 'express';

const deliveryRouter = express.Router();

deliveryRouter.post('/login', authControllers.login);

deliveryRouter.put('/take-order/:orderId', 
    authenticateAccessToken, 
    checkPermissions([ROLE_LIST.SUPERADMIN, ROLE_LIST.EMPLOYEE]), 
    deliveryController.takeDelivery
);

deliveryRouter.put('/upload-proof/:orderId', 
    authenticateAccessToken, 
    checkPermissions([ROLE_LIST.SUPERADMIN, ROLE_LIST.EMPLOYEE]), 
    deliveryController.uploadDeliveryProof
);

deliveryRouter.get('/get-all-deliveries', authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN), deliveryController.getAllDeliveries);
deliveryRouter.get(
    '/get-delivery-preparing',
    authenticateAccessToken,
    checkPermissions([ROLE_LIST.SUPERADMIN, ROLE_LIST.ADMIN, ROLE_LIST.EMPLOYEE]),
    deliveryController.getDeliveryPreparing
);

export default deliveryRouter;