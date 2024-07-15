import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';

export const checkDiscountCondition = (orderTotal, discountCondition) => {
    // console.log(orderTotal, discountCondition);
    const { orderTotalMin, orderTotalMax, startDate, endDate } = discountCondition;

    if (orderTotal < orderTotalMin || (orderTotalMax && orderTotal > orderTotalMax)) {
        throw new CustomError(StatusCodes.BAD_REQUEST, 'Order total does not meet voucher requirements');
    }

    const now = new Date();
    if (startDate && now < startDate) {
        throw new CustomError(StatusCodes.BAD_REQUEST, 'Discount code is not yet valid');
    }
    if (endDate && now > endDate) {
        throw new CustomError(StatusCodes.BAD_REQUEST, 'Discount code has expired');
    }

    return true;
};