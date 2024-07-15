import express from 'express';
import fetch from 'node-fetch';
import { CustomError } from '../errors/custom.error.js';
import { StatusCodes } from 'http-status-codes';
import { addressController } from '../controllers/address.controller.js';
import { shopServices } from '../services/shop.service.js';
import { calculateDistance } from '../utils//calculate_distance.util.js';

import dotenv from 'dotenv';
dotenv.config();

const addressRouter = express.Router();

addressRouter.get('/get-all-province', addressController.getAllProvince);
addressRouter.get('/get-address-by-pid', addressController.getAddressByPid);

addressRouter.get('/autocomplete', async (req, res) => {
    const apiKey = process.env.TOMTOM_API_KEY;
    const query = req.query.q;

    if (!query) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Search query is required' });
    }

    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.tomtom.com/search/2/autocomplete/${encodedQuery}.json?key=${apiKey}&language=vi-VN&limit=5`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch autocomplete results');
        }

        const data = await response.json();
        console.log(data.results[0].segments[0].value);
        const suggestions = data.results[0].segments.map(result => 
            {
        //          ({
        //     address: result.address.freeformAddress,
            
        //     position: result.position
        // })
        return ({ 
            address: result.value
        }) } 
    );

        res.json( suggestions );
        // console.log('Autocomplete results:', suggestions);
    } catch (error) {
        console.error('Error fetching autocomplete:', error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch autocomplete results' });
    }
});



addressRouter.get('/get-coordinates', async (req, res) => {
    const apiKey = process.env.TOMTOM_API_KEY;
    const query = req.query.q;

    if (!query) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Address query is required' });
    }

    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://api.tomtom.com/search/2/search/${encodedQuery}.json?key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch coordinates');
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'No coordinates found for the given address' });
        }

        const coordinates = data.results[0].position;
        const address = data.results[0].address.freeformAddress;

        const { lat, lon } = coordinates;
        const shops = await shopServices.getLocationShop();

        const distances = shops.map(shop => {
            const { latitude: shopLatitude, longitude: shopLongitude } = shop.location[0]; 
            const distance = calculateDistance(lat, lon, shopLatitude, shopLongitude);
            return { shop, distance };
        });

        distances.sort((a, b) => a.distance - b.distance);
        const nearestShop = distances[0];

        if (!nearestShop) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'No shops available' });
        }


        let shippingFee = 0;
        if (nearestShop.distance > 5) {
            shippingFee = 30000;
        }

        res.json({ 
            coordinates, 
            address, 
            shippingFee, 
            nearestShopId: nearestShop.shop._id 
        });
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch coordinates' });
    }
});



export default addressRouter;
