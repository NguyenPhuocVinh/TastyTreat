//create handle error middleware
// Path: backend/middlewares/errorhandle.js
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { CustomError } from '../errors/custom.error.js';


export const handleError = (err, req, res, next) => {
    let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let message = err.message || getReasonPhrase(statusCode);
    let isOperational = err.isOperational || true;

    if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }     
    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        isOperational,
    });
}
