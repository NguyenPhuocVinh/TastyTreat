import express from 'express';
import { checkoutController } from '../controllers/checkout.controller.js';
import { authenticateAccessToken } from '../middlewares/auth.middlewares.js';

const checkoutRouter = express.Router();

checkoutRouter.post('/create-checkout/:orderId', authenticateAccessToken, checkoutController.createCheckout);
checkoutRouter.get('/confirm-checkout', authenticateAccessToken, checkoutController.confirmCheckout);

export default checkoutRouter;