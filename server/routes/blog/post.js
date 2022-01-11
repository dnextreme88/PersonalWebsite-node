/* eslint-disable no-restricted-syntax */
const express = require('express');
const { ValidationError } = require('sequelize');
const ApiResponse = require('../../lib/ApiResponse');
const Helpers = require('../../lib/Helpers');

const router = express.Router();

module.exports = (params) => {
    const { categories, posts, users } = params;
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

    router.get('/year/:year/month/:month', async (request, response, next) => {
        try {
            const allPosts = await posts.getAllByYearMonth(request.params.year, request.params.month);

            return response.json(api.success(allPosts));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/year/:year', async (request, response, next) => {
        try {
            const allPosts = await posts.getAllByYear(request.params.year);

            return response.json(api.success(allPosts));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/month/:month', async (request, response, next) => {
        try {
            const allPosts = await posts.getAllByMonth(request.params.month);

            return response.json(api.success(allPosts));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/monthsAndYears', async (request, response, next) => {
        try {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthWithNum = {};

            for (let i = 0; i < months.length; i++) {
                let key = 0;
                if (i < 9) {
                    key = `0${i + 1}`;
                } else {
                    key = `${i + 1}`;
                }
                monthWithNum[months[i]] = key;
            }

            const startYear = 2011;
            const endYear = 2022;
            const monthWithYear = [];
            const allPosts = await posts.getAll();

            for (let j = endYear; j > startYear; j--) {
                for (const [key, value] of Object.entries(monthWithNum)) {
                    for (let k = 0; k < allPosts.length; k++) {
                        const postDate = allPosts[k].date;
                        const postYear = postDate.split('-')[0];
                        const postMonth = postDate.split('-')[1];

                        // Check if there's post for a given year and month (based on key)
                        if (j.toString() === postYear && value === postMonth) {
                            const data = {
                                month: postMonth,
                                year: postYear,
                                text: `${key} ${postYear}`,
                                count: 1,
                            };

                            const isYearInArray = monthWithYear.filter((obj) => obj.text === postYear).length > 0;

                            if (!isYearInArray) {
                                const obj = { text: postYear, count: 1 };
                                monthWithYear.push(obj);
                            } else {
                                for (let l = 0; l < monthWithYear.length; l++) {
                                    if (monthWithYear[l].text === postYear) monthWithYear[l].count += 1;
                                }
                            }

                            const isInArray = monthWithYear.filter((obj) => obj.text === data.text).length > 0;

                            if (!isInArray) {
                                monthWithYear.push(data);
                            } else {
                                for (let l = 0; l < monthWithYear.length; l++) {
                                    if (monthWithYear[l].text === data.text) monthWithYear[l].count += 1;
                                }
                            }
                        }
                    }
                }
            }

            return response.json(api.success(monthWithYear));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/categories/:categoryId', async (request, response, next) => {
        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.categoryId);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const category = await categories.getById(request.params.categoryId);
            if (!category) {
                return response.status(404).json(api.error(helpers.addErrorMessage('categoryId'), 404));
            }

            const allPosts = await posts.getAllByCategory(request.params.categoryId);

            return response.json(api.success(allPosts, 'Posts by category'));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/users/:userId', async (request, response, next) => {
        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.userId);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const user = await users.getById(request.params.userId);
            if (!user) {
                return response.status(404).json(api.error(helpers.addErrorMessage('userId'), 404));
            }

            const allPosts = await posts.getAllByUser(request.params.userId);

            return response.json(api.success(allPosts, 'Posts by user'));
        } catch (err) {
            return next(err);
        }
    });

    router.get('/users/:userId/latest', async (request, response, next) => {
        try {
            const checkIfIdIsInt = helpers.checkIfValidPositiveInteger(request.params.userId);
            if (checkIfIdIsInt.error === true) {
                return response.status(500).json(api.error(checkIfIdIsInt.message));
            }

            const user = await users.getById(request.params.userId);
            if (!user) {
                return response.status(404).json(api.error(helpers.addErrorMessage('userId'), 404));
            }

            const allPosts = await posts.getAllLatestByUser(request.params.userId);

            return response.json(api.success(allPosts, 'Posts by user (latest 5)'));
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
