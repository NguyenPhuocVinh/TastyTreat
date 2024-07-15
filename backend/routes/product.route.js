import { productController } from "../controllers/product.controller.js";
import express from "express";
import { authenticateAccessToken } from "../middlewares/auth.middlewares.js";
import {
  ROLE_LIST,
  checkPermissions,
} from "../middlewares/permission.middleware.js";

const productRouter = express.Router();

productRouter.get("/", productController.getAllProducts);
productRouter.post(
  "/create-product",
  authenticateAccessToken,
  checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
  productController.createProduct
);
productRouter.put(
  "/update-product/:productId",
  authenticateAccessToken,
  checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
  productController.updateProduct
);
productRouter.delete(
  "/delete-product/:productId",
  authenticateAccessToken,
  checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
  productController.deleteProduct
);
productRouter.get("/get-product/:productId", productController.getProductById);
productRouter.get("/get-product-by-category/:categoryId", productController.getProductsByCategory);
productRouter.get("/featured-products", productController.getFeaturedProducts);

export default productRouter;