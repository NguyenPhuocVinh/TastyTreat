import { Cart } from '../models/cart.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';

export const cartServices = {
    async addToCart(userId, productId, quantity) {
        try {
            let cart = await Cart.findOne({ userId });
    
            if (!cart) {
                // If no cart exists for the user, create a new one
                cart = new Cart({
                    userId,
                    products: [{ productId, quantity }]
                });
            } else {
                const product = cart.products.find(p => p.productId.equals(productId));
            if (product) {
                // Nếu sản phẩm đã tồn tại, cộng thêm số lượng
                product.quantity += quantity;
            } else {
                // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm mới
                cart.products.push({ productId, quantity });
            }
            }
    
            await cart.save();
            return cart;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    
    async removeFromCart(userId, productId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, error.message);
            }
            cart.products = cart.products.filter(p => !p.productId.equals(productId));
            await cart.save();
            return cart;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async updateCartItem(userId, productId, quantity) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Cart not found');
            }
            const productIndex = cart.products.findIndex(p => p.productId.equals(productId));
            if (productIndex !== -1) {
                if (quantity <= 0) {
                    cart.products.splice(productIndex, 1);
                } else {
                    // Update the product quantity
                    cart.products[productIndex].quantity = quantity;
                }
                await cart.save();
                return cart;
            } else {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Product not found in cart');
            }
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    
    async clearCart(userId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Cart not found');
            }
            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async createCart(userId) {
        try {
            const cart = new Cart({ userId });
            await cart.save();
            return cart;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async deleteCart(userId) {
        try {
            await Cart.deleteOne({ userId });
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getCartTotal(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('products.productId', 'price');
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Cart not found');
            }
            const total = cart.products.reduce((acc, item) => {
                return acc + item.productId.price * item.quantity;
            }, 0);
            return total;
            console.log(total);
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    async getCartCount(userId) {
        try {
            const cart = await Cart.findOne({ userId });
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Cart not found');
            }
            return cart.products.length;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Cart not found');
        }
    },
    async getCart(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('products.productId', 'productName price imagePath');
    
            if (!cart) {
                return {
                    message: 'Cart is empty'
                };
            }
    
            let totalAmount = 0;
            cart.products.forEach(product => {
                totalAmount += product.quantity * product.productId.price;
            });

            const formattedProducts = cart.products.map(product => ({
                _id: product._id,
                product: {
                    _id: product.productId._id,
                    productName: product.productId.productName,
                    price: product.productId.price,
                    imagePath: product.productId.imagePath,
                },
                quantity: product.quantity,
                totalPrice: product.quantity * product.productId.price
            }));
    
            return {
                cart: {
                    _id: cart._id,
                    userId: cart.userId,
                    products: formattedProducts,
                    totalAmount
                }
            };
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
    
    async getCartItems(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('products.productId', 'price');
            if (!cart) {
                throw new CustomError(StatusCodes.NOT_FOUND, 'Cart not found');
            }
            return cart.products;
        } catch (error) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
        }
    },
}
