const db = require('../models');

const hideAttributes = ['password'];

class UserService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const users = await db.User.findAll({
            attributes: { exclude: hideAttributes },
            order: [['createdAt', 'ASC']],
        });

        return users;
    }

    async getById(id) {
        const user = await db.User.findByPk(id, {
            attributes: { exclude: hideAttributes },
        });

        return user;
    }

    async getByEmail(email, showPassword = true) {
        let user = await db.User.findOne({
            where: { email },
        });

        if (!showPassword) {
            user = await db.User.findOne({
                where: { email },
                attributes: { exclude: hideAttributes },
            });
        }

        return user;
    }

    async createUser(body) {
        const newUser = await db.User.create({
            username: body.username,
            email: body.email,
            firstName: body.firstName,
            middleName: body.middleName,
            lastName: body.lastName,
            password: body.password,
        });

        return newUser;
    }

    async updateUser(id, body) {
        const user = await db.User.findByPk(id);
        const values = {
            username: body.username ? body.username : user.username,
            email: body.email ? body.email : user.email,
            firstName: body.firstName ? body.firstName : user.firstName,
            middleName: body.middleName ? body.middleName : user.middleName,
            lastName: body.lastName ? body.lastName : user.lastName,
            password: body.password ? body.password : user.password,
        };
        const updateUser = await db.User.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updateUser[1].dataValues;
    }

    async deleteUser(id) {
        await db.User.destroy({
            where: { id },
        });

        return 'User deleted';
    }
}

module.exports = UserService;
