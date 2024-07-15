import { randomAccount } from "../utils/random.util.js";
import { orderService } from "../services/order.service.js";
import { CustomError } from "../errors/custom.error.js";
import { StatusCodes } from "http-status-codes";
import { userServices } from "../services/user.service.js";
import { cartServices } from "../services/cart.service.js";
import { productServices } from "../services/product.service.js";
import { paymentServices } from "../services/payment.service.js";
import { emailService } from "../services/email.service.js";
import { deliveryServices } from "../services/delivery.service.js";
import { calculateDistance } from "../utils/calculate_distance.util.js";
import { discountServices } from "../services/discount.service.js";
import { checkDiscountCondition } from "../utils/check_discount.util.js";

export const orderController = {
    async createOrder(req, res) {
        try {
            const {
                fullName,
                email,
                phone,
                address,
                paymentMethod,
                products,
                voucherCode,
                shippingFee,
                shopId,
            } = req.body;

            if (!req.user) {
                if (!products || products.length === 0) {
                    throw new CustomError(
                        StatusCodes.BAD_REQUEST,
                        "No products provided for guest order"
                    );
                }

                const guestAccount = randomAccount();
                const guestUser = await userServices.createGuestUser(
                    fullName,
                    guestAccount.email,
                    guestAccount.password
                );

                const orderProducts = [];
                let totalAmount = 0;

                for (const item of products) {
                    const { productId, quantity } = item;
                    const product = await productServices.getProductById(
                        productId
                    );
                    if (!product) {
                        throw new CustomError(
                            StatusCodes.NOT_FOUND,
                            `Product with ID ${productId} not found`
                        );
                    }
                    orderProducts.push({
                        productId,
                        quantity,
                        price: product.price,
                    });
                    totalAmount += product.price * quantity;
                }

                let discountAmount = 0;
                if (voucherCode) {
                    const discount = await discountServices.getDiscountByCode(
                        voucherCode
                    );
                    if (!discount) {
                        throw new CustomError(
                            StatusCodes.BAD_REQUEST,
                            "Invalid voucher code"
                        );
                    }

                    checkDiscountCondition(totalAmount, discount.condition);

                    if (discount.type === "FIXED") {
                        discountAmount = discount.value;
                    } else if (discount.type === "PERCENT") {
                        discountAmount = (discount.value / 100) * totalAmount;
                    }

                    totalAmount -= discountAmount;
                }

                totalAmount += shippingFee;

                const newOrder = await orderService.createOrder({
                    userId: guestUser._id,
                    shopId,
                    fullName: fullName,
                    email: email,
                    phone,
                    address,
                    products: orderProducts,
                    shippingFee,
                    voucherCode,
                    voucherDiscount: discountAmount,
                    totalAmount,
                    paymentMethod,
                });

                if (paymentMethod === "CASH") {
                    Promise.all([
                        emailService.sendBillEmail(email, newOrder._id),
                        // paymentServices.createPayment(
                        //     newOrder._id,
                        //     null,
                        //     totalAmount,
                        //     "PENDING"
                        // ),
                        deliveryServices.createDelivery({
                            orderId: newOrder._id,
                            deliveryDate: new Date(),
                            status: "SHIPPING",
                        }),
                    ]);
                }
                const payment = await paymentServices.createPayment(
                    newOrder._id,
                    null,
                    totalAmount,
                    "PENDING"
                );

                return res
                    .status(StatusCodes.CREATED)
                    .json({ newOrder, payment: payment });
            } else {
                // Handling order for logged-in user
                const userId = req.user.userId;
                const cart = await cartServices.getCartItems(userId);
                const checkCart = await cartServices.getCartCount(userId);

                if (checkCart === 0) {
                    throw new CustomError(
                        StatusCodes.BAD_REQUEST,
                        "Cart is empty"
                    );
                }

                const user = await userServices.getUserById(userId);
                let totalAmount = await cartServices.getCartTotal(userId);

                let discountAmount = 0;
                if (voucherCode) {
                    const discount = await discountServices.getDiscountByCode(
                        voucherCode
                    );
                    if (!discount) {
                        throw new CustomError(
                            StatusCodes.BAD_REQUEST,
                            "Invalid voucher code"
                        );
                    }

                    checkDiscountCondition(totalAmount, discount.condition);

                    if (discount.type === "FIXED") {
                        discountAmount = discount.value;
                    } else if (discount.type === "PERCENT") {
                        discountAmount = (discount.value / 100) * totalAmount;
                    }

                    totalAmount -= discountAmount;
                }

                totalAmount += shippingFee;

                const orderData = {
                    userId,
                    shopId,
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    address,
                    products: cart,
                    shippingFee,
                    voucherCode,
                    voucherDiscount: discountAmount,
                    totalAmount,
                    paymentMethod,
                };

                const newOrder = await orderService.createOrder(orderData);
                if (paymentMethod === "CASH") {
                    Promise.all([
                        // paymentServices.createPayment(
                        //     newOrder._id,
                        //     null,
                        //     totalAmount,
                        //     "SUCCESS"
                        // ),
                        deliveryServices.createDelivery({
                            orderId: newOrder._id,
                            deliveryDate: new Date(),
                            status: "PREPARING",
                        }),
                        emailService.sendBillEmail(user.email, newOrder._id),
                    ]);
                }
                const payment = await paymentServices.createPayment(
                    newOrder._id,
                    null,
                    totalAmount,
                    "PENDING"
                );
                await cartServices.clearCart(userId);

                return res
                    .status(StatusCodes.CREATED)
                    .json({ newOrder, payment });
            }
        } catch (error) {
            console.log(error);
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: error.message });
        }
    },

    async getOrderByUserId(req, res) {
        try {
            const userId = req.user.userId;
            const orders = await orderService.getOrderByUserId(userId);

            // Map each order to include its payment information
            const ordersWithPayments = await Promise.all(
                orders.map(async (order) => {
                    const orderId = order._id;
                    const payment = await paymentServices.getPaymentByOrderId(
                        orderId
                    );
                    return { ...order.toObject(), payment }; // Combine order and payment
                })
            );

            return res
                .status(StatusCodes.OK)
                .json({ orders: ordersWithPayments });
        } catch (error) {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: error.message });
        }
    },

    async getAllOrders(req, res) {
        try {
            const orders = await orderService.getOrders();
            // Map each order to include its delivery and payment information
            const ordersWithDetails = await Promise.all(
                orders.map(async (order) => {
                    const orderId = order._id;
                    const delivery =
                        await deliveryServices.getDeliveryByOrderId(orderId);
                    const payment = await paymentServices.getPaymentByOrderId(
                        orderId
                    );
                    return { ...order.toObject(), delivery, payment }; // Combine order, delivery, and payment
                })
            );
            return res
                .status(StatusCodes.OK)
                .json({ orders: ordersWithDetails });
        } catch (error) {
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: error.message });
        }
    },
};
