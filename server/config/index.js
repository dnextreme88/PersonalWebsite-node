require('dotenv').config();
const bunyan = require('bunyan');

const loggers = {
    development: () => {
        return bunyan.createLogger({
            name: 'personalwebsite-dev',
            level: 'debug',
            serializers: { err: bunyan.stdSerializers.err },
        });
    },
    production: () => {
        return bunyan.createLogger({
            name: 'personalwebsite-prod',
            level: 'info',
            serializers: { err: bunyan.stdSerializers.err },
        });
    },
    test: () => {
        return bunyan.createLogger({
            name: 'personalwebsite-test',
            level: 'fatal',
            serializers: { err: bunyan.stdSerializers.err },
        });
    },
};

module.exports = {
    development: {
        log: loggers.development,
        database: {
            hostName: process.env.HOST_NAME_DEV,
            portNumber: process.env.PORT_DEV,
            username: process.env.USERNAME_DEV,
            password: process.env.PASSWORD_DEV,
            database: process.env.DB_DEV,
            dialect: 'postgres',
        },
    },
    production: {
        log: loggers.production,
        database: {
            hostName: process.env.HOST_NAME_PROD,
            portNumber: process.env.PORT_PROD,
            username: process.env.USERNAME_PROD,
            password: process.env.PASSWORD_PROD,
            database: process.env.DB_PROD,
            dialect: 'postgres',
        },
    },
    test: {
        log: loggers.test,
        database: {
            hostName: process.env.HOST_NAME_TEST,
            portNumber: process.env.PORT_TEST,
            username: process.env.USERNAME_TEST,
            password: process.env.PASSWORD_TEST,
            database: process.env.DB_TEST,
            dialect: 'postgres',
        },
    },
};
