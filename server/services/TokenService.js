require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const db = require('../models');

class TokenService {
    constructor(log) {
        this.log = log;
    }

    async getByToken(token) {
        const getToken = await db.Token.findOne({
            where: { token },
        });

        return getToken;
    }

    async createToken(body) {
        const values = {
            token: body.token,
            isExpired: false,
            expiresAt: body.expiresAt,
            userId: body.userId,
        };
        const newToken = await db.Token.create(values);

        return newToken;
    }

    async signJwt(userId, userEmail) {
        const signedToken = await jwt.sign({ id: userId, email: userEmail }, process.env.JWT_SECRET_OR_KEY, { expiresIn: '12h', notBefore: '0' });
        const tokenExpirationEpoch = new Date().setHours(new Date().getHours() + 12);
        const tokenExpiration = new Date(tokenExpirationEpoch).toString();

        return { token: signedToken, dateExpiration: tokenExpiration };
    }

    async expireToken(id) {
        const expiredToken = await db.Token.update({ isExpired: true }, {
            where: { id },
            returning: true,
            plain: true,
        });

        return expiredToken[1].dataValues;
    }

    async isTokenValid(token, userId) {
        const getToken = await db.Token.findOne({
            where: {
                token,
                expiresAt: { [Op.gte]: new Date().toISOString() },
                userId,
            },
        });

        return getToken;
    }

    async isTokenExpired(token) {
        const getToken = await db.Token.findOne({
            where: { token, isExpired: true },
        });

        if (getToken) return true;

        return false;
    }

    async deleteToken(id) {
        await db.Token.destroy({
            where: { id },
        });

        return 'Token deleted';
    }
}

module.exports = TokenService;
