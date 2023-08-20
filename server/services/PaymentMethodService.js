const { Sequelize } = require('sequelize');
const db = require('../models');

class PaymentMethodService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const paymentMethods = await db.PaymentMethod.findAll({
            include: { model: await db.SoldItem, as: 'soldItem' },
            order: [['createdAt', 'ASC']],
        });

        return paymentMethods;
    }

    async getAllCountAndSumByMethod(type) {
        const methods = [];

        await db.PaymentMethod.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('method')), 'methodName'],
                [Sequelize.fn('COUNT', Sequelize.col('method')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('soldItem.price')), 'sum'],
            ],
            group: 'method',
            include: { model: await db.SoldItem, as: 'soldItem', attributes: [] },
        }).then((result) => {
            result.forEach((paymentMethod) => {
                if (type === 'count') {
                    methods.push({ method: paymentMethod.dataValues.methodName, count: paymentMethod.dataValues.count });
                } else if (type === 'sum') {
                    methods.push({ method: paymentMethod.dataValues.methodName, sum: paymentMethod.dataValues.sum });
                }
            });
        });

        return methods;
    }

    async getAllCountAndSumByLocation(type) {
        const locations = [];

        await db.PaymentMethod.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('remittanceLocation')), 'location'],
                [Sequelize.fn('COUNT', Sequelize.col('remittanceLocation')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('soldItem.price')), 'sum'],
            ],
            group: 'remittanceLocation',
            include: { model: await db.SoldItem, as: 'soldItem', attributes: [] },
        }).then((result) => {
            result.forEach((paymentMethod) => {
                if (type === 'count') {
                    locations.push({ location: paymentMethod.dataValues.location, count: paymentMethod.dataValues.count });
                } else if (type === 'sum') {
                    locations.push({ location: paymentMethod.dataValues.location, sum: paymentMethod.dataValues.sum });
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
        const paymentMethod = await db.PaymentMethod.findByPk(id, {
            include: { model: await db.SoldItem, as: 'soldItem' },
        });

        return paymentMethod;
    }

    async getBySoldItemId(soldItemId) {
        const paymentMethod = await db.PaymentMethod.findOne({
            where: { soldItemId },
            include: { model: await db.SoldItem, as: 'soldItem' },
        });

        return paymentMethod;
    }

    async createPaymentMethod(body) {
        const values = {
            method: body.method,
            remittanceLocation: body.remittanceLocation,
            soldItemId: body.soldItemId,
        };
        const newPaymentMethod = await db.PaymentMethod.create(values);

        return newPaymentMethod;
    }

    async updatePaymentMethod(id, body) {
        const paymentMethod = await db.PaymentMethod.findByPk(id);
        const values = {
            method: body.method ? body.method : paymentMethod.method,
            remittanceLocation: body.remittanceLocation ? body.remittanceLocation : paymentMethod.remittanceLocation,
            soldItemId: body.soldItemId ? body.soldItemId : paymentMethod.soldItemId,
        };
        const updatedPaymentMethod = await db.PaymentMethod.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedPaymentMethod[1].dataValues;
    }

    async deletePaymentMethod(id) {
        await db.PaymentMethod.destroy({
            where: { id },
        });

        return 'Payment method deleted';
    }
}

module.exports = PaymentMethodService;
