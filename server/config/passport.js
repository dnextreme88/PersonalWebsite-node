/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
/* eslint-disable no-sync */
/* eslint-disable object-shorthand */
// Import dotenv for JWT key
require('dotenv').config();
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy; // signin and signup
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const config = require('./index')[process.env.NODE_ENV || 'development'];
const db = require('../models');

const log = config.log();

// Export local strategies, passing Passport module and the User table from server.js
module.exports = (passport) => {
    const Auth = db.User;
    // Tell passport to use a new LocalStrategy called "local-signup"
    passport.use('local-signup', new LocalStrategy(
        {
            // By default, Passport LocalStrategy uses a username and a password
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true, // So we can encrypt the password and add an entry into the Sequelize table
            session: false, // Don't use session storage, as we'll be setting JWT to local storage client side
        }, async (req, email, password, done) => {
            // Check the User table for an entry matching the user-inputted email
            Auth.findOne({
                where: { email: email },
            }).then((user) => {
                if (user) {
                    return done(null, false, { message: 'That email is already taken.', status: 400 });
                } else {
                    // REF: https://pretagteam.com/question/bcrypt-compare-hash-and-password
                    bcrypt.hash(password, 12, (err, hash) => {
                        if (err) return done(null, false, { message: 'Hashing failed.', status: 500 });

                        // Create a row in the User table with the user's information
                        const values = {
                            username: req.body.username,
                            email: email,
                            firstName: req.body.firstName,
                            middleName: req.body.middleName,
                            lastName: req.body.lastName,
                            password: hash,
                        };
                        Auth.create(values).then((newUser) => {
                            if (!newUser) {
                                // Return error: null and user: false
                                return done(null, false, { message: 'Our servers are under a heavy load right now. Please try again in a moment.' });
                            }
                            // Otherwise, return error: null and the newUser
                            return done(null, newUser);
                        });
                    });
                }
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
            // Check the User table for an entry matching the user-inputted email
            const user = await Auth.findOne({
                where: { email: email },
            });
            if (user) {
                // Load hashed password from db
                // REF: https://pretagteam.com/question/bcrypt-compare-hash-and-password
                bcrypt.compare(password, user.password, (err, isValidPassword) => {
                    if (err) return done(null, false, { message: 'Password comparison failed.', status: 500 });

                    // If the user-inputted password does not match the password from the User table
                    if (!isValidPassword) {
                        // Return error: null, user: false
                        return done(null, false, { message: 'Incorrect password.', status: 400 });
                    }

                    const userInfo = user.get();
                    // Return error: null and the authenticated user information
                    return done(null, userInfo);
                });
            }

            // If no entry matches the user-inputted email
            if (!user) {
                // Return error: null, user: false
                return done(null, false, { message: 'Email does not exist in our database', status: 404 });
            }
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

        const user = await Auth.findOne({
            where: { id: jwtPayload.id },
        });
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
