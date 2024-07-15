import { categoryController } from "../controllers/category.controller.js";
import express from "express";
import { authenticateAccessToken } from "../middlewares/auth.middlewares.js";
import {
  ROLE_LIST,
  checkPermissions,
} from "../middlewares/permission.middleware.js";

const categoryRouter = express.Router();

categoryRouter.post("/create-category", authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN), categoryController.createCategory);    
categoryRouter.put("/update-category/:categoryId", authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN), categoryController.updateCategory);
categoryRouter.delete("/delete-category/:categoryId", authenticateAccessToken, checkPermissions(ROLE_LIST.SUPERADMIN), categoryController.deleteCategory);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:categoryId", categoryController.getCategoryById);

export default categoryRouter;