const { Sequelize } = require('sequelize');
const db = require('../models');

class SellMethodService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const sellMethods = await db.SellMethod.findAll({
            include: { model: await db.SoldItem, as: 'soldItem' },
            order: [['createdAt', 'ASC']],
        });

        return sellMethods;
    }

    async getAllCountAndSumByMethod(type) {
        const methods = [];

        await db.SellMethod.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('method')), 'methodName'],
                [Sequelize.fn('COUNT', Sequelize.col('method')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('soldItem.price')), 'sum'],
            ],
            group: 'method',
            include: { model: await db.SoldItem, as: 'soldItem', attributes: [] },
        }).then((result) => {
            result.forEach((sellMethod) => {
                if (type === 'count') {
                    methods.push({ method: sellMethod.dataValues.methodName, count: sellMethod.dataValues.count });
                } else if (type === 'sum') {
                    methods.push({ method: sellMethod.dataValues.methodName, sum: sellMethod.dataValues.sum });
                }
            });
        });

        return methods;
    }

    async getAllCountAndSumByLocation(type) {
        const locations = [];

        await db.SellMethod.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('location')), 'location'],
                [Sequelize.fn('COUNT', Sequelize.col('location')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('soldItem.price')), 'sum'],
            ],
            group: 'location',
            include: { model: await db.SoldItem, as: 'soldItem', attributes: [] },
        }).then((result) => {
            result.forEach((sellMethod) => {
                if (type === 'count') {
                    locations.push({ location: sellMethod.dataValues.location, count: sellMethod.dataValues.count });
                } else if (type === 'sum') {
                    locations.push({ location: sellMethod.dataValues.location, sum: sellMethod.dataValues.sum });
                }
            });
        });

        if (type === 'count') {
            locations.sort((a, b) => b.count - a.count);
        } else if (type === 'sum') {
            locations.sort((a, b) => b.sum - a.sum);
        }

        return locations;
    }

    async getById(id) {
        const sellMethod = await db.SellMethod.findByPk(id, {
            include: { model: await db.SoldItem, as: 'soldItem' },
        });

        return sellMethod;
    }

    async getBySoldItemId(soldItemId) {
        const sellMethod = await db.SellMethod.findOne({
            where: { soldItemId },
            include: { model: await db.SoldItem, as: 'soldItem' },
        });

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
