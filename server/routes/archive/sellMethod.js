const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { sellMethods } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allSellMethods = await sellMethods.getAll();

            return response.json(api.success(allSellMethods));
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

            const sellMethod = await sellMethods.getById(request.params.id);
            if (!sellMethod) {
                return response.status(404).json(api.error('Sell method not found', 404));
            }

            return response.json(api.success(sellMethod));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newSellMethod = await sellMethods.createSellMethod(request.body);

            return response.status(201).json(api.success(newSellMethod, 'Sell method created'));
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

            const sellMethod = await sellMethods.getById(request.params.id);
            if (!sellMethod) {
                return response.status(404).json(api.error('Sell method not found', 404));
            }

            const updatedSellMethod = await sellMethods.updateSellMethod(request.params.id, request.body);

            return response.json(api.success(updatedSellMethod, 'Sell method updated'));
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

            const sellMethod = await sellMethods.getById(request.params.id);
            if (!sellMethod) {
                return response.status(404).json(api.error('Sell method not found', 404));
            }

            const deletedSellMethod = await sellMethods.deleteSellMethod(request.params.id);

            return response.json(api.success(null, deletedSellMethod));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
