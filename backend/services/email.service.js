import { StatusCodes } from "http-status-codes";
import { createTransporter } from "../config/email.config.js";
import { CustomError } from "../errors/custom.error.js";
import { Order } from "../models/order.model.js";
import { Payment } from "../models/payment.model.js";
import { productServices } from "./product.service.js";
import { shopServices } from "./shop.service.js";

export const emailService = {
  async sendOTPEmail(email, otp) {
    try {
      const transporter = await createTransporter();
      const mailOptions = {
        from: `TastyTreat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`,
      };
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  },
  async sendResetPasswordToken(email, link) {
    try {
      const transporter = await createTransporter();
      const mailOptions = {
        from: `TastyTreat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Password",
        text: "Your password reset token",
        html: `Click <a href="${link}">here</a> to reset your password`,
      };
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  },
  async sendBillEmail(email, orderId) {
    try {
      // Find order details
      const order = await Order.findById(orderId);
      if (!order) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Order not found");
      }

      // Find payment details
      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Payment not found");
      }

      // Find shop details
      const shop = await shopServices.getShopById(order.shopId);
      if (!shop) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Shop not found");
      }

      const VND = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      const transporter = await createTransporter();

      // Function to get product name from productId
      async function getProductName(productId) {
        const product = await productServices.getProductById(productId);
        return product ? product.productName : "Product Not Found";
      }

      // Replace productId with productName in email template
      const productsHtml = await Promise.all(
        order.products.map(async (product) => {
          const productName = await getProductName(product.productId);
          return `
                <li>
                    <strong>Product Name:</strong> ${productName}<br>
                    <strong>Quantity:</strong> ${product.quantity}
                </li>
            `;
        })
      );

      const mailOptions = {
        from: `TastyTreat <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Order Confirmation",
        html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .ticket {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      border: 2px dashed #d09215;
      padding: 10px 30px 0px 30px;
      max-width: 600px;
      margin: auto;
      background-color: #fff;
    }

    .ticket h1 {
      word-wrap: nowrap;
      color: #fff;
      font-size: 27px;
      background-color: #d09215;
      padding: 5px;
    }

    .ticket h2 {
      word-wrap: nowrap;
      color: #d09215;
      font-size: 17px;
    }

    .ticket p {
      word-wrap: nowrap;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .header img {
      width: 100px;
      height: 100px;
      padding-bottom: 10px;
      border-radius: 50%;
      margin: 0 auto;
      display: block;
    }

    .ticket .section {
      margin-bottom: 20px;
    }

    .ticket .section strong {
      display: inline-block;
      min-width: 150px;
    }

    .ticket .section ul {
      list-style-type: none;
      font-size: 12px;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
      padding: 0;
      padding-bottom: 5px;
      color: #333;
    }

    .ticket .header {
      text-align: center;
    }

    .ticket .barcode {
      text-align: center;
      margin-top: 20px;
    }

    .ticket .barcode img {
      max-width: 80%;
    }

    .hr-footer {
      border: 0;
      height: 3px;
      background: #d09215;
      margin: 20px 0;
    }


  </style>
</head>

<body>
  <div class="ticket">
    <div class="header">
      <h1><img src="https://img.freepik.com/premium-vector/fast-food-icons-design_24911-35801.jpg?w=826" alt="">Order
        Details</h1>
    </div>
    <h2>Shop Information</h2>
                        <div class="section">
                            <p><strong>Shop Name:</strong> ${shop.name}</p>
                            <p><strong>Shop Address:</strong> ${
                              shop.address
                            }</p>
                        </div>
    <div class="section">
    <h2>Customer Information</h2>
      <p><strong>Full Name:</strong> ${order.fullName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Address:</strong> ${order.address}</p>
    </div>
    <h2>Products</h2>
    <div class="section">
      <ul>
        ${productsHtml.join("")}
      </ul>
    </div>
    <hr class="hr-footer">
    <div class="section">
    <p><strong>Discount code:</strong> ${order.voucherCode || "N/A"}</p>
    <p><strong>Discount Amount:</strong> ${VND.format(order.voucherDiscount)}</p>
    <p><strong>Shipping Fee:</strong> ${VND.format(order.shippingFee)}</p>
      <p><strong>Total Amount:</strong> ${VND.format(order.totalAmount)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    </div>
    <h2>Payment Status</h2>
    <div class="section">
      <p><strong>Status:</strong> ${payment.status}</p>
      <p><strong>Payment Date:</strong> ${new Date(
        payment.paymentDate
      ).toLocaleString()}</p>
    </div>
      
  </div>

</body>

</html>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  async sendBillEmailPayment(orderId) {
    try {
      // Find order details
      const order = await Order.findById(orderId);
      if (!order) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Order not found");
      }

      // Find payment details
      const payment = await Payment.findOne({ orderId });
      if (!payment) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Payment not found");
      }

      // Find shop details
      const shop = await shopServices.getShopById(order.shopId);
      if (!shop) {
        throw new CustomError(StatusCodes.NOT_FOUND, "Shop not found");
      }

      const VND = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      const transporter = await createTransporter();

      // Function to get product name from productId
      async function getProductName(productId) {
        const product = await productServices.getProductById(productId);
        return product ? product.productName : "Product Not Found";
      }

      // Replace productId with productName in email template
      const productsHtml = await Promise.all(
        order.products.map(async (product) => {
          const productName = await getProductName(product.productId);
          return `
                <li>
                    <strong>Product Name:</strong> ${productName}<br>
                    <strong>Quantity:</strong> ${product.quantity}
                </li>
            `;
        })
      );

      const mailOptions = {
        from: `TastyTreat <${process.env.EMAIL_USER}>`,
        to: order.email,
        subject: "Order Confirmation",
        html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .ticket {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      border: 2px dashed #d09215;
      padding: 10px 30px 0px 30px;
      max-width: 600px;
      margin: auto;
      background-color: #fff;
    }

    .ticket h1 {
      word-wrap: nowrap;
      color: #fff;
      font-size: 27px;
      background-color: #d09215;
      padding: 5px;
    }

    .ticket h2 {
      word-wrap: nowrap;
      color: #d09215;
      font-size: 17px;
    }

    .ticket p {
      word-wrap: nowrap;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .header img {
      width: 100px;
      height: 100px;
      padding-bottom: 10px;
      border-radius: 50%;
      margin: 0 auto;
      display: block;
    }

    .ticket .section {
      margin-bottom: 20px;
    }

    .ticket .section strong {
      display: inline-block;
      min-width: 150px;
    }

    .ticket .section ul {
      list-style-type: none;
      font-size: 12px;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
      padding: 0;
      padding-bottom: 5px;
      color: #333;
    }

    .ticket .header {
      text-align: center;
    }

    .ticket .barcode {
      text-align: center;
      margin-top: 20px;
    }

    .ticket .barcode img {
      max-width: 80%;
    }

    .hr-footer {
      border: 0;
      height: 3px;
      background: #d09215;
      margin: 20px 0;
    }


  </style>
</head>

<body>
  <div class="ticket">
    <div class="header">
      <h1><img src="https://img.freepik.com/premium-vector/fast-food-icons-design_24911-35801.jpg?w=826" alt="">Order
        Details</h1>
    </div>
    <h2>Shop Information</h2>
                        <div class="section">
                            <p><strong>Shop Name:</strong> ${shop.name}</p>
                            <p><strong>Shop Address:</strong> ${
                              shop.address
                            }</p>
                        </div>
    <div class="section">
    <h2>Customer Information</h2>
      <p><strong>Full Name:</strong> ${order.fullName}</p>
      <p><strong>Email:</strong> ${order.email}</p>
      <p><strong>Address:</strong> ${order.address}</p>
    </div>
    <h2>Products</h2>
    <div class="section">
      <ul>
        ${productsHtml.join("")}
      </ul>
    </div>
    <hr class="hr-footer">
    <div class="section">
    <p><strong>Discount code:</strong> ${order.voucherCode || "N/A"}</p>
    <p><strong>Discount Amount:</strong> ${VND.format(order.voucherDiscount)}</p>
    <p><strong>Shipping Fee:</strong> ${VND.format(order.shippingFee)}</p>
      <p><strong>Total Amount:</strong> ${VND.format(order.totalAmount)}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    </div>
    <h2>Payment Status</h2>
    <div class="section">
      <p><strong>Status:</strong> ${payment.status}</p>
      <p><strong>Payment Date:</strong> ${new Date(
        payment.paymentDate
      ).toLocaleString()}</p>
    </div>
      
  </div>

</body>

</html>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
  },
};
