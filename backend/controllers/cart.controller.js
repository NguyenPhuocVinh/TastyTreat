import { cartServices } from '../services/cart.service.js';
import { StatusCodes } from 'http-status-codes';

export const cartController = {
    async addToCart(req, res, next) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.userId;
    
            if (!userId || !productId || !quantity) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'userId, productId, and quantity are required' });
            }
            const cart = await cartServices.addToCart(userId, productId, quantity);
            res.status(StatusCodes.OK).json({ cart });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    
    async removeFromCart(req, res, next) {
        try {
            const { productId } = req.body;
            const userId = req.user.userId;

            const cart = await cartServices.removeFromCart(userId, productId);
            res.status(StatusCodes.OK).json({ cart });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async updateCartItem(req, res, next) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.userId;
            const cart = await cartServices.updateCartItem(userId, productId, quantity);
            res.status(StatusCodes.OK).json({ cart });
        } catch (error) {
            // next(res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message }));
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async clearCart(req, res, next) {
        try {
            const userId = req.user.userId;
            const cart = await cartServices.clearCart(userId);
            res.status(StatusCodes.OK).json({ cart });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async createCart(req, res, next) {
        try {
            const userId = req.user.userId;
            const cart = await cartServices.createCart(userId);
            res.status(StatusCodes.CREATED).json({ cart });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async getCart(req, res, next) {
        try {
            const userId = req.user.userId;
    
            if (!userId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: 'userId is required' });
            }
    
            const { cart, totalPrice } = await cartServices.getCart(userId);
            if (!cart) {
                return res.status(StatusCodes.OK).json({ message: 'Cart is empty' });
            }
            res.status(StatusCodes.OK).json({ cart, totalPrice });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    
    async getCartItems(req, res, next) {
        try {
            const userId = req.user.userId;
            const cart = await cartServices.getCartItems(userId);
            res.status(StatusCodes.OK).json({ cart });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}