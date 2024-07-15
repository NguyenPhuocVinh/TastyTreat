import { StatusCodes } from 'http-status-codes';
import { addressService } from '../services/address.service.js';
import { CustomError } from '../errors/custom.error.js';

export const addressController = {
    async getAddressByPid(req, res) {
        try {
            const pid = req.body.pid;
            const address = await addressService.getAddressByPid(pid);
            res.status(StatusCodes.OK).send({ address });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: error.message });
    
        }
    },
    async getAllProvince(req, res) {
        try {
            const provinces = await addressService.getAllProvince();
            res.status(StatusCodes.OK).send({ provinces });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: error.message });
        }
    }
}