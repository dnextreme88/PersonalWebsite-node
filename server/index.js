const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const httpErrors = require('http-errors');
const routes = require('./routes');

const CategoryService = require('./services/CategoryService');
const PaymentMethodService = require('./services/PaymentMethodService');
const PostService = require('./services/PostService');
const SellMethodService = require('./services/SellMethodService');
const SoldItemService = require('./services/SoldItemService');
const UserService = require('./services/UserService');

module.exports = (config) => {
    const app = express();
    app.use(helmet());
    app.use(compression());
    const log = config.log();

    // So that the frontend framework can send axios requests to the backend
    const corsOptions = {
        origin: '*',
        credentials: true, // access-control-allow-credentials:true
        optionSuccessStatus: 200,
    };
    app.use(cors(corsOptions));

    // Services
    const users = new UserService(log);

    // -- Archive
    const paymentMethods = new PaymentMethodService(log);
    const sellMethods = new SellMethodService(log);
    const soldItems = new SoldItemService(log);

    // -- Blog
    const categories = new CategoryService(log);
    const posts = new PostService(log);

    app.get('/favicon.ico', (req, res) => res.sendStatus(204));
    app.get('/', (request, response) => response.send('Hello world!'));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (app.get('env') === 'production') {
        /**
         * If true, the client’s IP address is understood as the left-most entry in the
         * X-Forwarded-For header. Additionally, an IP address, subnet, or an array of IP addresses
         * and subnets that are trusted to be a reverse proxy are set loopback is the
         * pre-configured subnet name for: 127.0.0.1/8, ::1/128
         */
        app.set('trust proxy', 'loopback');
    }

    app.use('/api/', routes({
        categories,
        paymentMethods,
        posts,
        sellMethods,
        soldItems,
        users,
    }));

    // Catch non-existing routes (404s) and forward to error handler
    app.use((req, res, next) => next(httpErrors(404)));

    // Custom error handler to extend default Express error handler
    app.use(async (err, req, res, next) => {
        // Enable last
        // If the error occurs after the response headers have been sent,
        // let the default Express error handler catch it
        // if (res.headersSent) return next(err);

        if (req.xhr) {
            log.error(err);
            const status = err.status || 500;
            try {
                return res
                    .status(status)
                    .json({ msg: err.message || '', stack: err.stack || '' });
            } catch (e) {
                return next(e);
            }
        } else {
            log.error(err);
            const status = err.status || 500;
            res.locals.status = status;
            const errOptions = req.app.get('env') === 'development' ?
                { msg: err.message || '', stack: err.stack || '' } :
                {};
            try {
                return res.status(status).json(errOptions);
            } catch (e) {
                return next(e);
            }
        }
    });

    return app;
};
