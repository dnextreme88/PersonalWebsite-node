const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

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

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newSoldItem = await soldItems.createSoldItem(request.body);

            return response.status(201).json(api.success(newSoldItem, 'Sold item created'));
        } catch (err) {
            if (err instanceof ValidationError) {
                err.errors.forEach((error) => { errorList[error.path] = error.message; });
            }

            response.status(400).json({ errors: errorList, statusCode: 400 });

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
