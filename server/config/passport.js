/* eslint-disable consistent-return */
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy; // signin and signup
const BearerStrategy = require('passport-http-bearer').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const config = require('./index')[process.env.NODE_ENV || 'development'];
const db = require('../models');
const TokenService = require('../services/TokenService');
const UserService = require('../services/UserService');

const log = config.log();

// Export local strategies, passing Passport module and the User table from server.js
module.exports = (passport) => {
    const tokens = new TokenService(log);
    const users = new UserService(log);
    // Tell passport to use a new LocalStrategy called "local-signup"
    passport.use('local-signup', new LocalStrategy(
        {
            // By default, Passport LocalStrategy uses a username and a password
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // So we can encrypt the password and add an entry into the Sequelize table
            session: false, // Don't use session storage, as we'll be setting JWT to local storage client side
        }, async (req, email, password, done) => {
            const user = await users.getByEmail(email);
            if (user) {
                return done(null, false, { message: 'That email is already taken.', status: 400 });
            }

            // REF: https://pretagteam.com/question/bcrypt-compare-hash-and-password
            bcrypt.hash(password, 12, async (err, hash) => {
                if (err) return done(null, false, { message: 'Hashing failed.', status: 500 });

                const values = {
                    username: req.body.username,
                    email,
                    firstName: req.body.firstName,
                    middleName: req.body.middleName,
                    lastName: req.body.lastName,
                    password: hash,
                };
                const newUser = await users.createUser(values);
                if (!newUser) {
                    // Return error: null and user: false, info: { message }
                    return done(null, false, { message: 'Our servers are under a heavy load right now. Please try again in a moment.' });
                }

                // Return error: null and the newly created User
                return done(null, newUser);
            });
        },
    ));

    // Tell passport to use a new LocalStrategy called "local-signin"
    passport.use('local-signin', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // For email/password comparison to the User table
            session: false, // Don't use session storage, as we'll be setting JWT to local storage client side
        }, async (req, email, password, done) => {
            const user = await users.getByEmail(email);
            if (user) {
                // Load hashed password from db
                // REF: https://pretagteam.com/question/bcrypt-compare-hash-and-password
                bcrypt.compare(password, user.password, (err, isValidPassword) => {
                    if (err) return done(null, false, { message: 'Password comparison failed.', status: 500 });

                    // If the user-inputted password does not match the password from the User table
                    if (!isValidPassword) {
                        // Return error: null, user: false, info: { message }
                        return done(null, false, { message: 'Incorrect password.', status: 400 });
                    }

                    const userInfo = user.get();

                    // Return error: null and the authenticated user information
                    return done(null, userInfo);
                });
            }

            // If no entry matches the user-inputted email
            // Return error: null, user: false, info: { message }
            return done(null, false, { message: 'Email does not exist in our database', status: 404 });
        },
    ));

    // Define options for JWT to extract from Auth Header using secret key
    const opts = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET_OR_KEY,
    };

    passport.use('jwt', new JWTstrategy(opts, async (jwtPayload, done) => {
        log.info(`JWT Payload ID: ${jwtPayload.id}`);
        log.info(`JWT Payload Email: ${jwtPayload.email}`);

        const user = await users.getById(jwtPayload.id);
        if (user) {
            log.info('Passport success: User found in database from config/passport.js');
            const userJwt = {
                id: jwtPayload.id,
                email: jwtPayload.email,
                issuedAt: new Date(jwtPayload.iat * 1000).toString(),
                notBefore: new Date(jwtPayload.nbf * 1000).toString(),
                expiresIn: new Date(jwtPayload.exp * 1000).toString(),
            };
            // Return error: null, user: userJwt
            return done(null, userJwt);
        }

        log.info('User not found in database from config/passport.js');
        // Return error: null, user: false, info: { message, status }
        return done(null, false, { message: 'User not found in database', status: 500 });
    }));

    passport.use('bearer', new BearerStrategy(async (token, done) => {
        await jwt.verify(token, process.env.JWT_SECRET_OR_KEY, async (error, decoded) => {
            if (error) {
                let errorMessage;
                if (error.name === 'JsonWebTokenError') {
                    errorMessage = { message: error.message };
                } else if (error.name === 'TokenExpiredError') {
                    errorMessage = { message: `Token expired on ${error.expiredAt}` };
                }

                return done(null, false, errorMessage);
            }

            // Check if token is valid and not yet expired
            // decoded is an object returned by jwt.sign() function
            const queryToken = await tokens.isTokenValid(token, decoded.id);
            if (!queryToken) return done(null, false, { message: 'Token not found' });

            const user = await users.getById(queryToken.userId);

            // Access the scope key by passing request.authInfo under route middlewares
            return done(null, user, { scope: 'read' });
        });
    }));

    // Save the user id (the second argument of the done function) in a session. It is later used
    // to retrieve the whole object via the deserializeUser function
    passport.serializeUser((auth, done) => {
        done(null, auth.id);
    });

    // Retrieve the user id from the stored session
    passport.deserializeUser((id, done) => {
        // Check the User table for a matching user id and pass the user information into the parameter of the callback function
        db.User.findById(id).then((user) => {
            if (user) {
                // Return error: null, and the user's authentication information
                return done(null, user.get());
            }
            // Otherwise, the user's id was not found, or the session was destroyed
            // Return the specific error, user: null
            return done(user.errors, null);
        });
    });
};
