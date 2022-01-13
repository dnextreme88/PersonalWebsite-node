const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../lib/ApiResponse');
const Helpers = require('../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { guides } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allGuides = await guides.getAll();

            return response.json(api.success(allGuides));
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

            const guide = await guides.getById(request.params.id);
            if (!guide) {
                return response.status(404).json(api.error('Guide not found', 404));
            }

            return response.json(api.success(guide));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newGuide = await guides.createGuide(request.body);

            return response.status(201).json(api.success(newGuide, 'Guide created'));
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

            const guide = await guides.getById(request.params.id);
            if (!guide) {
                return response.status(404).json(api.error('Guide not found', 404));
            }

            const updatedGuide = await guides.updateGuide(
                request.params.id, request.body,
            );

            return response.json(api.success(updatedGuide, 'Guide updated'));
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

            const guide = await guides.getById(request.params.id);
            if (!guide) {
                return response.status(404).json(api.error('Guide not found', 404));
            }

            const deletedGuide = await guides.deleteGuide(request.params.id);

            return response.json(api.success(null, deletedGuide));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
