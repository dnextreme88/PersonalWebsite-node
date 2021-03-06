require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');
const config = require('../config')[process.env.NODE_ENV || 'development'];
const TokenService = require('../services/TokenService');

const router = express.Router();
const formatOut = bformat({ outputMode: 'short' });
const logger = bunyan.createLogger({ name: 'authRoutes', stream: formatOut, level: 'info' });

module.exports = () => {
    const tokens = new TokenService(config.log());

    // POST route to signup using our local strategy 'local-signup'
    router.post('/user/signup', async (req, res, next) => {
        passport.authenticate('local-signup', async (err, user, info) => {
            if (err) return res.json({ error: err });

            if (!user) {
                return res.status(info.status).json({
                    auth: false,
                    message: info.message,
                    error: true,
                    statusCode: info.status,
                    data: null,
                });
            }

            // Sign JWT then create the record in DB
            const signedToken = await tokens.signJwt(user.id, user.email);
            const values = {
                token: signedToken.token,
                expiresAt: signedToken.dateExpiration,
                userId: user.id,
            };
            await tokens.createToken(values);

            return res.status(201).json({
                auth: true,
                message: 'User and Token created',
                error: false,
                statusCode: 201,
                data: { token: signedToken.token, tokenValidity: signedToken.dateExpiration, user },
            });
        })(req, res, next);
    });

    // POST route to sign in using our local strategy 'local-signin'
    router.post('/user/signin', async (req, res, next) => {
        passport.authenticate('local-signin', async (err, user, info) => {
            if (err) return res.json({ error: err });

            if (!user) {
                return res.status(info.status).json({
                    auth: false,
                    message: info.message,
                    error: true,
                    statusCode: info.status,
                    data: null,
                });
            }

            // Sign JWT then create the record in DB
            const signedToken = await tokens.signJwt(user.id, user.email);
            const values = {
                token: signedToken.token,
                expiresAt: signedToken.dateExpiration,
                userId: user.id,
            };
            await tokens.createToken(values);

            return res.json({
                auth: true,
                message: 'User logged in',
                error: false,
                statusCode: 200,
                data: { token: signedToken.token, tokenValidity: signedToken.dateExpiration, user },
            });
        })(req, res, next);
    });

    router.post('/user/signout', async (req, res, next) => {
        passport.authenticate('bearer', async (err, user, info) => {
            if (err) return res.json({ error: err });

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

            const token = await tokens.getByToken(bearerToken.slice(7));
            await tokens.expireToken(token.id);

            logger.info(`LOG: Token manually expired and user is logged out.`);
            return res.json({
                auth: false,
                message: 'User logged out',
                error: false,
                statusCode: 200,
                data: null,
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

                    return res.status(403).json({
                        auth: false,
                        message: error.message,
                        error: true,
                        statusCode: 403,
                        data: dataObj,
                    });
                }

                return decoded;
            });

            // Check if the token is in the DB or if it has expired
            const token = await tokens.getByToken(req.body.token);
            if (!token) {
                return res.status(404).json({
                    auth: false,
                    message: 'Token not found',
                    error: true,
                    statusCode: 404,
                    data: null,
                });
            }

            const isTokenExpired = await tokens.isTokenExpired(req.body.token);
            if (isTokenExpired) {
                return res.status(401).json({
                    auth: false,
                    message: 'Token has expired',
                    error: true,
                    statusCode: 401,
                    data: null,
                });
            }

            return res.json({
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

    return router;
};
