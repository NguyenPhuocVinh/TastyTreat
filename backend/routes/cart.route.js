import express from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { authenticateAccessToken } from '../middlewares/auth.middlewares.js';

const cartRouter = express.Router();

cartRouter.post('/add-to-cart', authenticateAccessToken, cartController.addToCart);
cartRouter.post('/remove-from-cart', authenticateAccessToken, cartController.removeFromCart);
cartRouter.put('/update-cart-item', authenticateAccessToken, cartController.updateCartItem);
cartRouter.post('/clear-cart', authenticateAccessToken, cartController.clearCart);
cartRouter.post('/create-cart', authenticateAccessToken, cartController.createCart);
cartRouter.get('/get-cart', authenticateAccessToken, cartController.getCart);
cartRouter.get('/get-cart-item', authenticateAccessToken, cartController.getCartItems);

export default cartRouter;