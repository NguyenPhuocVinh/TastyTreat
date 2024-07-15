import express from 'express';
import { discountController } from '../controllers/discount.controller.js';
import { authenticateAccessToken } from '../middlewares/auth.middlewares.js';
import {
    ROLE_LIST,
    checkPermissions,
} from "../middlewares/permission.middleware.js";

const discountRouter = express.Router();

discountRouter.post('/create-discount', authenticateAccessToken,
    checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
    discountController.createDiscount
);

discountRouter.get('/get-discount/:discountId', authenticateAccessToken,
    discountController.getDiscountByCode
);

discountRouter.get('/get-all-discounts', authenticateAccessToken,
    discountController.getAllDiscounts
);

discountRouter.put('/update-discount/:discountId', authenticateAccessToken,
    checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
    discountController.updateDiscount
);

discountRouter.delete('/delete-discount/:discountId', authenticateAccessToken,
    checkPermissions(ROLE_LIST.SUPERADMIN || ROLE_LIST.ADMIN),
    discountController.deleteDiscount
);

export default discountRouter;

