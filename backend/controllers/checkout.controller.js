import { StatusCodes } from 'http-status-codes';
import { orderService } from '../services/order.service.js';
import moment from 'moment';
import crypto from 'crypto';
import querystring from 'qs';
import { sortObject } from '../utils/sort.util.js';
import { paymentServices } from '../services/payment.service.js';
import { emailService } from "../services/email.service.js";
import { deliveryServices } from '../services/delivery.service.js';




export const checkoutController = {
    async createCheckout(req, res) {
        try {
            const { orderId } = req.params;
            const date = new Date();
            const createDate = moment(date).format("YYYYMMDDHHmmss");
            const vnp_TxnRef = moment(date).format("HHmmss");

            const ipAddr = req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                (req.connection.socket && req.connection.socket.remoteAddress);

            const tmnCode = process.env.vnp_TmnCode;
            const secretKey = process.env.vnp_HashSecret;
            let vnpUrl = process.env.vnp_Url;
            const returnUrl = process.env.vnp_ReturnUrl;
            console.log(returnUrl)
            const amount = await orderService.getTotalAmountById(orderId);
            const bankCode = "";    
            const locale = "vn";
            const currCode = "VND";

            let vnp_Params = {
                "vnp_Version": "2.1.0",
                "vnp_Command": "pay",
                "vnp_TmnCode": tmnCode,
                "vnp_Locale": locale,
                "vnp_CurrCode": currCode,
                "vnp_TxnRef": vnp_TxnRef,
                "vnp_OrderInfo": `Thanh toán cho mã GD: ${vnp_TxnRef} Mã order: ${orderId}`,
                "vnp_OrderType": "other",
                "vnp_Amount": amount * 100,
                "vnp_ReturnUrl": returnUrl,
                "vnp_IpAddr": ipAddr,
                "vnp_CreateDate": createDate
            };

            if (bankCode) {
                vnp_Params["vnp_BankCode"] = bankCode;
            }

            // Step 1: Sort and encode vnp_Params
            vnp_Params = sortObject(vnp_Params);

            // Step 2: Generate signature
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
            vnp_Params["vnp_SecureHash"] = signed;
            vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

            const checkPayment = await paymentServices.getPaymentByOrderId(orderId);
            if (checkPayment) {
                const payment = await paymentServices.checkStatusPaymentByOrderId(orderId);
                if (payment === "PAID") {
                    return res.status(StatusCodes.BAD_REQUEST).json({message: "Order has been paid" });
                }
                if (payment === "PENDING") {
                    await paymentServices.updateVnpayRefByOrderId(orderId, vnp_TxnRef);
                }
            }else {
                await paymentServices.createPayment(orderId, vnp_TxnRef, amount);
            }
            res.status(StatusCodes.OK).json({ code: "00", data: vnpUrl });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },
    async confirmCheckout(req, res) {
        try {
            // Extract parameters from the query
            let vnp_Params = req.query;
            const secureHash = vnp_Params["vnp_SecureHash"];
    
            // Remove the hash parameters for signature verification
            delete vnp_Params["vnp_SecureHash"];
            delete vnp_Params["vnp_SecureHashType"];
    
            // Sort and prepare for signature verification
            vnp_Params = sortObject(vnp_Params);
    
            // Retrieve secret key from environment variables
            const tmnCode = process.env.vnp_TmnCode;
            const secretKey = process.env.vnp_HashSecret;
    
            // Generate signature for comparison
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    
            // Compare generated signature with received secureHash
            if (secureHash === signed) {
                // Signature matched; payment is successful
                const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
                const orderId = await paymentServices.findPaymentByVnpayRef(vnp_TxnRef);
                Promise.all([
                    paymentServices.updatePaymentStatus(vnp_TxnRef, "SUCCESS"),
                    deliveryServices.createDelivery({
                        orderId: orderId.orderId,
                        deliveryDate: new Date(),
                        status: "PREPARING"
                    }),
                    emailService.sendBillEmailPayment(orderId.orderId),
                ]);
                // const updatePaymentStatus = await paymentServices.updatePaymentStatus(vnp_TxnRef, "PAID");
                // const sendBillEmail = await emailService.sendBillEmail(orderId.orderId);
                // const delivery = await deliveryServices.createDelivery({
                //     orderId: orderId.orderId,
                //     deliveryDate: new Date(),
                //     status: "SHIPPING"
                // });
                return res.status(StatusCodes.OK).json({ code: "00", message: "Payment successful"});
            } else {
                // Signature mismatch; potential tampering
                const vnp_TxnRef = vnp_Params["vnp_TxnRef"];
                const orderId = await paymentServices.findPaymentByVnpayRef(vnp_TxnRef);
                Promise.all([
                    paymentServices.updatePaymentStatus(vnp_TxnRef, "FAILED"),
                    deliveryServices.createDelivery({
                        orderId: orderId.orderId,
                        deliveryDate: new Date(),
                        status: "CANCELLED"
                    }),
                ]);
                await paymentServices.updatePaymentStatus(vnp_TxnRef, "FAILED");
                return res.status(StatusCodes.BAD_REQUEST).json({ code: "97", message: "Invalid secure hash" });
            }
        } catch (error) {
            console.error("Error processing VNPAY return:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
    }
    
};
