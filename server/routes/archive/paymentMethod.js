const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { paymentMethods } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allPaymentMethods = await paymentMethods.getAll();

            return response.json(api.success(allPaymentMethods));
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

            const paymentMethod = await paymentMethods.getById(request.params.id);
            if (!paymentMethod) {
                return response.status(404).json(api.error('Payment method not found', 404));
            }

            return response.json(api.success(paymentMethod));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newPaymentMethod = await paymentMethods.createPaymentMethod(request.body);

            return response.status(201).json(api.success(newPaymentMethod, 'Payment method created'));
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

            const paymentMethod = await paymentMethods.getById(request.params.id);
            if (!paymentMethod) {
                return response.status(404).json(api.error('Payment method not found', 404));
            }

            const updatedPaymentMethod = await paymentMethods.updatePaymentMethod(request.params.id, request.body);

            return response.json(api.success(updatedPaymentMethod, 'Payment method updated'));
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

            const paymentMethod = await paymentMethods.getById(request.params.id);
            if (!paymentMethod) {
                return response.status(404).json(api.error('Payment method not found', 404));
            }

            const deletedPaymentMethod = await paymentMethods.deletePaymentMethod(request.params.id);

            return response.json(api.success(null, deletedPaymentMethod));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
