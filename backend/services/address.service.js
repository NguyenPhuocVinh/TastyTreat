import { Address } from '../models/address.model.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';

export const addressService = {

    async getAllProvince() {
        return await Address.find({pid: null});
    },

    async getAddressByPid(pid) {
        const address = await Address.find({pid: pid});
        const addresses = address.map(a => ({
            id: a.id,
            name: a.name,
        }));
        return addresses;
    },
    

}