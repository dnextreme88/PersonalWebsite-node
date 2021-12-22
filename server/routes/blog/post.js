const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { posts } = params;
    const api = new ApiResponse();
    const helpers = new Helpers();

    router.get('/', async (request, response, next) => {
        try {
            const allPosts = await posts.getAll();

            return response.json(api.success(allPosts));
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

            const post = await posts.getById(request.params.id);
            if (!post) {
                return response.status(404).json(api.error('Post not found', 404));
            }

            return response.json(api.success(post));
        } catch (err) {
            return next(err);
        }
    });

    router.post('/', async (request, response, next) => {
        const errorList = {};

        try {
            const newPost = await posts.createPost(request.body);

            return response.status(201).json(api.success(newPost, 'Post created'));
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

            const post = await posts.getById(request.params.id);
            if (!post) {
                return response.status(404).json(api.error('Post not found', 404));
            }

            const updatedPost = await posts.updatePost(request.params.id, request.body);

            return response.json(api.success(updatedPost, 'Post updated'));
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

            const post = await posts.getById(request.params.id);
            if (!post) {
                return response.status(404).json(api.error('Post not found', 404));
            }

            const deletedPost = await posts.deletePost(request.params.id);

            return response.json(api.success(null, deletedPost));
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
