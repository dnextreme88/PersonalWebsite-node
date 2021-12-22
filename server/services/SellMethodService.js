const db = require('../models');

class SellMethodService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const sellMethods = await db.SellMethod.findAll({
            order: [['createdAt', 'ASC']],
        });

        return sellMethods;
    }

    async getById(id) {
        const sellMethod = await db.SellMethod.findByPk(id);

        return sellMethod;
    }

    async createSellMethod(body) {
        const values = {
            method: body.method,
            location: body.location,
            soldItemId: body.soldItemId,
        };
        const newSellMethod = await db.SellMethod.create(values);

        return newSellMethod;
    }

    async updateSellMethod(id, body) {
        const sellMethod = await db.SellMethod.findByPk(id);
        const values = {
            method: body.method ? body.method : sellMethod.method,
            location: body.location ? body.location : sellMethod.location,
            soldItemId: body.soldItemId ? body.soldItemId : sellMethod.soldItemId,
        };
        const updatedSellMethod = await db.SellMethod.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedSellMethod[1].dataValues;
    }

    async deleteSellMethod(id) {
        await db.SellMethod.destroy({
            where: { id },
        });

        return 'Sell method deleted';
    }
}

module.exports = SellMethodService;
