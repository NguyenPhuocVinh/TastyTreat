import express from 'express';
import { shopController } from '../controllers/shop.controller.js';
import { authenticateAccessToken } from "../middlewares/auth.middlewares.js";
import {
  ROLE_LIST,
  checkPermissions,
} from "../middlewares/permission.middleware.js";

const shopRouter = express.Router();

shopRouter.post('/create-shop', authenticateAccessToken, checkPermissions([ROLE_LIST.ADMIN || ROLE_LIST.SUPERADMIN]), shopController.createShop);
shopRouter.post('/calculate-distance', shopController.calculateDistanceToShop);
shopRouter.post('/login', shopController.loginForShop);

export default shopRouter;