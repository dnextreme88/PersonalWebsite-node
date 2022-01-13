/* eslint-disable global-require */
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const httpErrors = require('http-errors');
const routes = require('./routes');

const CategoryService = require('./services/CategoryService');
const GuideService = require('./services/GuideService');
const PaymentMethodService = require('./services/PaymentMethodService');
const PostService = require('./services/PostService');
const SellMethodService = require('./services/SellMethodService');
const SoldItemService = require('./services/SoldItemService');
const TokenService = require('./services/TokenService');
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
    const guides = new GuideService(log);
    const tokens = new TokenService(log);
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

    require('./config/passport')(passport); // Load passport strategies
    app.use(passport.initialize()); // Initialize Passport

    // Load passport routes to be used for accessing API routes
    const authRoutesIndex = require('./routes/authRoutesIndex');
    const authRoutes = require('./routes/authRoutes')(passport);
    app.use('/passport/', authRoutesIndex({ authRoutes }));

    // Protect routes and require a Bearer token in the Authorization Header
    // REF: https://github.com/jaredhanson/passport/blob/935fbdbc2f63eb0a746a3e1373fb112c5efee6b6/lib/middleware/authenticate.js#L23-L40
    app.use('/api/', (req, res, next) => {
        passport.authenticate('bearer', (err, user, info) => {
            if (err) return next(err);

            // Get bearer token from Authorization Header and check if bearer token is null or if
            // it only contains "Bearer"
            const bearerToken = req.header('authorization');
            if (!bearerToken || bearerToken.length < 7) {
                return res.status(401).json({
                    auth: false,
                    message: 'Token not found in Authorization headers',
                    error: true,
                    statusCode: 401,
                    data: null,
                });
            }

            if (!user) {
                const errorDesc = info.split(', ')[2];
                const errorDescIndex = errorDesc.indexOf('"') + 1; // Remove opening apostrophe
                const message = errorDesc.slice(errorDescIndex, errorDesc.length - 1);

                return res.status(401).json({
                    auth: false,
                    message,
                    error: true,
                    statusCode: 401,
                    data: null,
                });
            }

            return next();
        })(req, res, next);
    }, routes({
        categories,
        guides,
        paymentMethods,
        posts,
        sellMethods,
        soldItems,
        tokens,
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
