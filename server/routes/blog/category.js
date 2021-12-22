const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { categories } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allCategories = await categories.getAll();

            return response.json(api.success(allCategories));
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

            const category = await categories.getById(request.params.id);
            if (!category) {
                return response.status(404).json(api.error('Category not found', 404));
            }

            return response.json(api.success(category));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newCategory = await categories.createCategory(request.body);

            return response.status(201).json(api.success(newCategory, 'Category created'));
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

            const category = await categories.getById(request.params.id);
            if (!category) {
                return response.status(404).json(api.error('Category not found', 404));
            }

            const updatedCategory = await categories.updateCategory(
                request.params.id, request.body,
            );

            return response.json(api.success(updatedCategory, 'Category updated'));
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

            const category = await categories.getById(request.params.id);
            if (!category) {
                return response.status(404).json(api.error('Category not found', 404));
            }

            const deletedCategory = await categories.deleteCategory(request.params.id);

            return response.json(api.success(null, deletedCategory));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
