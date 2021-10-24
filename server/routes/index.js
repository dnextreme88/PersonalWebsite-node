const express = require('express');

const router = express.Router();
const userRoutes = require('./user');

module.exports = (params) => {
    // Routes start with api/, which is defined under server/index.js
    router.use('/users', userRoutes(params));

    // Return the router object
    return router;
};
