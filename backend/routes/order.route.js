import express from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authenticateAccessToken } from '../middlewares/auth.middlewares.js';
import {
    ROLE_LIST,
    checkPermissions,
} from "../middlewares/permission.middleware.js";


const orderRouter = express.Router();

orderRouter.post('/create-order', authenticateAccessToken, orderController.createOrder);
orderRouter.get('/get-history', authenticateAccessToken, orderController.getOrderByUserId);
orderRouter.get('/get-all-orders', authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN), orderController.getAllOrders);


export default orderRouter;