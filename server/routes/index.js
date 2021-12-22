const express = require('express');

const router = express.Router();
const categoryRoutes = require('./blog/category');
const paymentMethodRoutes = require('./archive/paymentMethod');
const postRoutes = require('./blog/post');
const sellMethodRoutes = require('./archive/sellMethod');
const soldItemRoutes = require('./archive/soldItem');
const userRoutes = require('./user');

module.exports = (params) => {
    // Routes start with api/, which is defined under server/index.js
    router.use('/users', userRoutes(params));

    // -- Archive
    router.use('/paymentMethods', paymentMethodRoutes(params));
    router.use('/sellMethods', sellMethodRoutes(params));
    router.use('/soldItems', soldItemRoutes(params));

    // -- Blog
    router.use('/blog/categories', categoryRoutes(params));
    router.use('/blog/posts', postRoutes(params));

    return router;
};
