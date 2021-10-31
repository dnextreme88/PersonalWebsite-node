const express = require('express');

const router = express.Router();
const categoryRoutes = require('./blog/category');
const postRoutes = require('./blog/post');
const userRoutes = require('./user');

module.exports = (params) => {
    // Routes start with api/, which is defined under server/index.js
    router.use('/users', userRoutes(params));

    router.use('/blog/categories', categoryRoutes(params));
    router.use('/blog/posts', postRoutes(params));

    return router;
};
