const fs = require('fs');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid').v4;
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();
const directory = 'uploads/';
const storageConfig = multer.diskStorage({
    destination: async (req, file, cb) => {
        if (!fs.existsSync(directory)) fs.mkdirSync(directory);

        cb(null, directory);
    },
    filename: async (req, file, cb) => {
        cb(null, `${uuid()}__${file.originalname}`);
    },
});

const upload = multer({ storage: storageConfig });

module.exports = (params) => {
    const { soldItems } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allSoldItems = await soldItems.getAll();

            return response.json(api.success(allSoldItems));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/:id', async (request, response, next) => {
        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.id);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const soldItem = await soldItems.getById(request.params.id);
            if (!soldItem) {
                return response.status(404).json(api.error('Sold item not found', 404));
            }

            return response.json(api.success(soldItem));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', upload.single('imageFile'), async (request, response, next) => {
        const errorList = {};

        try {
            const soldItemValues = {
                name: request.body.name,
                price: request.body.price,
                condition: request.body.condition,
                size: request.body.size,
                imageLocation: request.file ? directory + request.file.filename : null,
                dateSold: request.body.dateSold,
            };
            const paymentMethodValues = {
                paymentMethod: request.body.paymentMethod,
                paymentLocation: request.body.paymentLocation,
            };
            const sellMethodValues = {
                sellMethod: request.body.sellMethod,
                sellLocation: request.body.sellLocation,
            };

            const newSoldItem = await soldItems.createSoldItem(
                soldItemValues, paymentMethodValues, sellMethodValues,
            );

            return response.status(201).json(api.success(newSoldItem, 'Sold item created'));
        } catch (err) {
            if (err instanceof ValidationError) {
                err.errors.forEach((error) => { errorList[error.path] = error.message; });
            }

            response.status(400).json({ errors: errorList, statusCode: 400 });

            return next(err);
        }
    });

    router.post('/filter', async (request, response, next) => {
        try {
            const filterParams = {
                month: request.body.month ? request.body.month : '',
                year: request.body.year ? request.body.year.toString() : '',
                brand: request.body.brand ? request.body.brand : '',
                type: request.body.type ? request.body.type : '',
                condition: request.body.condition ? request.body.condition : '',
                size: request.body.size ? request.body.size : '',
                paymentMethod: request.body.paymentMethod ? request.body.paymentMethod : '',
                sellMethod: request.body.sellMethod ? request.body.sellMethod : '',
            };

            const allSoldItems = await soldItems.getAllByFilter(filterParams);

            return response.json(api.success(allSoldItems));
        } catch (err) {
            return next(err);
        }
    });

    // UPDATE
    router.post('/:id/update', async (request, response, next) => {
        const errorList = {};

        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.id);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const soldItem = await soldItems.getById(request.params.id);
            if (!soldItem) {
                return response.status(404).json(api.error('Sold item not found', 404));
            }

            const updatedSoldItem = await soldItems.updateSoldItem(request.params.id, request.body);

            return response.json(api.success(updatedSoldItem, 'Sold item updated'));
        } catch (err) {
            if (err instanceof ValidationError) {
                err.errors.forEach((error) => { errorList[error.path] = error.message; });
            }

            response.status(400).json({ errors: errorList, statusCode: 400 });

            return next(err);
        }
    });

    // DELETE
    router.post('/:id/delete', async (request, response, next) => {
        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.id);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const soldItem = await soldItems.getById(request.params.id);
            if (!soldItem) {
                return response.status(404).json(api.error('Sold item not found', 404));
            }

            const deletedSoldItem = await soldItems.deleteSoldItem(request.params.id);

            return response.json(api.success(null, deletedSoldItem));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
