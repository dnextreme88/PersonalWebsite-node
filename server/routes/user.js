const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../lib/ApiResponse');
const Helpers = require('../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { users } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allUsers = await users.getAll();

            return response.json(api.success(allUsers));
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

            const user = await users.getById(request.params.id);
            if (!user) {
                return response.status(404).json(api.error('User not found', 404));
            }

            return response.json(api.success(user));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newUser = await users.createUser(request.body);

            return response.status(201).json(api.success(newUser));
        } catch (err) {
            if (err instanceof ValidationError) {
                err.errors.forEach((error) => {
                    errorList[error.path] = error.message;
                });
            }

            response.status(400).json({
                errors: errorList,
                statusCode: 400,
            });

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

            const user = await users.getById(request.params.id);
            if (!user) {
                return response.status(404).json(api.error('User not found', 404));
            }

            const updateUser = await users.updateUser(request.params.id, request.body);

            return response.json(api.success(updateUser));
        } catch (err) {
            if (err instanceof ValidationError) {
                err.errors.forEach((error) => {
                    errorList[error.path] = error.message;
                });
            }

            response.status(400).json({
                errors: errorList,
                statusCode: 400,
            });

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

            const user = await users.getById(request.params.id);
            if (!user) {
                return response.status(404).json(api.error('User not found', 404));
            }

            const deleteUser = await users.deleteUser(request.params.id);

            return response.json(api.success(deleteUser));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
