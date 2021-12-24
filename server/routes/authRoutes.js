require('dotenv').config();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('../models');

const router = express.Router();

module.exports = () => {
    // POST route to signup using our local strategy 'local-signup'
    router.post('/user/signup', async (req, res, next) => {
        passport.authenticate('local-signup', async (err, user, info) => {
            if (err) {
                return res.json({ error: err });
            }

            if (!user) {
                return res.status(info.status).send({
                    auth: false,
                    message: info.message,
                    error: true,
                    statusCode: info.status,
                    data: null,
                });
            }

            // Upon successful signup and authentication, create a JWT and send a response
            const token = await jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_OR_KEY, { expiresIn: '12h', notBefore: '0' });
            const tokenExpirationEpoch = new Date().setHours(new Date().getHours() + 12);
            const tokenExpiration = new Date(tokenExpirationEpoch).toString();

            return res.status(201).send({
                auth: true,
                message: 'User created and created JWT',
                error: false,
                statusCode: 201,
                data: { token, tokenValidity: tokenExpiration, user },
            });
        })(req, res, next);
    });

    // POST route to sign in using our local strategy 'local-signin'
    router.post('/user/signin', async (req, res, next) => {
        passport.authenticate('local-signin', async (err, user, info) => {
            if (err) {
                return res.json({ error: err });
            }

            if (!user) {
                return res.status(info.status).send({
                    auth: false,
                    message: info.message,
                    error: true,
                    statusCode: info.status,
                    data: null,
                });
            }

            // Upon successful signin and authentication, create a JWT and send a response
            const token = await jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_OR_KEY, { expiresIn: '12h', notBefore: '0' });
            const tokenExpirationEpoch = new Date().setHours(new Date().getHours() + 12);
            const tokenExpiration = new Date(tokenExpirationEpoch).toString();

            return res.send({
                auth: true,
                message: 'User logged in',
                error: false,
                statusCode: 200,
                data: { token, tokenValidity: tokenExpiration, user },
            });
        })(req, res, next);
    });

    // GET /authenticate?email={req.query.email}
    router.get('/authenticate', async (req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) {
                return res.json({ error: err });
            }

            if (info) {
                let dataObj;
                if (info.name === 'JsonWebTokenError') {
                    dataObj = null;
                } else if (info.name === 'TokenExpiredError') {
                    dataObj = { expiredAt: info.expiredAt };
                }

                return res.status(403).send({
                    auth: false,
                    message: info.message,
                    error: true,
                    statusCode: 403,
                    data: dataObj,
                });
            }

            const findUser = await db.User.findOne({
                where: { email: req.query.email },
            });
            if (!findUser) {
                return res.status(404).send({
                    auth: false,
                    message: 'No user exists in the database with that email',
                    error: true,
                    statusCode: 404,
                    data: null,
                });
            }

            return res.send({
                auth: true,
                message: 'User found in database',
                error: false,
                statusCode: 200,
                data: {
                    id: user.id,
                    email: user.email,
                    issuedAt: user.issuedAt,
                    notBefore: user.notBefore,
                    expiresIn: user.expiresIn,
                },
            });
        })(req, res, next);
    });

    // POST verify token
    router.post('/verifyJwt', async (req, res, next) => {
        try {
            const verifiedJwt = await jwt.verify(req.body.token, process.env.JWT_SECRET_OR_KEY, async (error, decoded) => {
                if (error) {
                    let dataObj;
                    if (error.name === 'JsonWebTokenError') {
                        dataObj = null;
                    } else if (error.name === 'TokenExpiredError') {
                        dataObj = { expiredAt: error.expiredAt };
                    }

                    return res.status(403).send({
                        auth: false,
                        message: error.message,
                        error: true,
                        statusCode: 403,
                        data: dataObj,
                    });
                }

                return decoded;
            });
            return res.send({
                auth: true,
                message: 'JWT Payload information',
                error: false,
                statusCode: 200,
                data: {
                    id: verifiedJwt.id,
                    email: verifiedJwt.email,
                    issuedAt: new Date(verifiedJwt.iat * 1000).toString(),
                    notBefore: new Date(verifiedJwt.nbf * 1000).toString(),
                    expiresIn: new Date(verifiedJwt.exp * 1000).toString(),
                },
            });
        } catch (err) {
            return next(err);
        }
    });

    // Custom unauthorized message when user credentials aren't valid
    router.get('/unauthorized', async (request, response, next) => {
        try {
            return response.status(401).json({
                auth: false,
                message: 'Unauthorized',
                error: true,
                statusCode: 401,
                data: null,
            });
        } catch (err) {
            return next(err);
        }
    });

    return router;
};
