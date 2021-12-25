const db = require('../models');

class TokenService {
    constructor(log) {
        this.log = log;
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

    async expireToken(id) {
        const expiredToken = await db.Token.update({ isExpired: true }, {
            where: { id },
            returning: true,
            plain: true,
        });

        return expiredToken[1].dataValues;
    }

    async deleteToken(id) {
        await db.Token.destroy({
            where: { id },
        });

        return 'Token deleted';
    }
}

module.exports = TokenService;
