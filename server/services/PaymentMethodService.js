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

    async getById(id) {
        const paymentMethod = await db.PaymentMethod.findByPk(id, {
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
