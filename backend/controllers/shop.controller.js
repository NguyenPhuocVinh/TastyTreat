import { shopServices } from '../services/shop.service.js';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import { calculateDistance } from '../utils/calculate_distance.util.js';
import { authServices } from '../services/auth.service.js';

export const shopController = {

    async loginForShop(req, res) {
        try {
            const { userName, password } = req.body;
            const userShop = await authServices.loginForShop(userName, password);
            res.status(StatusCodes.OK).json(userShop);

        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message }); 
        }   
    },

    async createShop(req, res) {
        try {
            const shop = await shopServices.createShop(req.body);
            res.status(StatusCodes.CREATED).json(shop);
        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    },

    async calculateDistanceToShop(req, res) {
        try {
            const { latitude, longitude } = req.body.location;
            const maxDistance = req.body.maxDistance || 10; 

            if (latitude === undefined || longitude === undefined) {
                throw new CustomError(StatusCodes.BAD_REQUEST, "Missing required fields: latitude and longitude");
            }

            const shops = await shopServices.getLocationShop();


            const distances = shops.map(shop => {
                const { latitude: shopLatitude, longitude: shopLongitude } = shop.location[0]; // Access coordinates from array
                const distance = calculateDistance(latitude, longitude, shopLatitude, shopLongitude);
                return { shop, distance };
            });

            const filteredDistances = distances.filter(d => d.distance <= maxDistance);

            filteredDistances.sort((a, b) => a.distance - b.distance);
            console.log(filteredDistances);

            res.status(StatusCodes.OK).json(filteredDistances);
        } catch (error) {
            res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}