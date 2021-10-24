require('dotenv').config();

const envir = process.env.NODE_ENV || 'development';
const config = require('./index')[envir].database;

module.exports = {
    [envir]: {
        host: config.hostName,
        port: config.portNumber,
        username: config.username,
        password: config.password,
        database: config.database,
        dialect: config.dialect,
    },
};
