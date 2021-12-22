const db = require('../models');

class SoldItemService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const soldItems = await db.SoldItem.findAll({
            order: [['createdAt', 'ASC']],
        });

        return soldItems;
    }

    async getById(id) {
        const soldItem = await db.SoldItem.findByPk(id);

        return soldItem;
    }

    async createSoldItem(body) {
        const values = {
            name: body.name,
            price: body.price,
            condition: body.condition,
            size: body.size,
            imageLocation: body.imageLocation,
            dateSold: body.dateSold,
        };
        const newSoldItem = await db.SoldItem.create(values);

        return newSoldItem;
    }

    async updateSoldItem(id, body) {
        const soldItem = await db.SoldItem.findByPk(id);
        const values = {
            name: body.name ? body.name : soldItem.name,
            price: body.price ? body.price : soldItem.price,
            condition: body.condition ? body.condition : soldItem.condition,
            size: body.size ? body.size : soldItem.size,
            imageLocation: body.imageLocation ? body.imageLocation : soldItem.imageLocation,
            dateSold: body.dateSold ? body.dateSold : soldItem.dateSold,
        };
        const updatedSoldItem = await db.SoldItem.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedSoldItem[1].dataValues;
    }

    async deleteSoldItem(id) {
        await db.SoldItem.destroy({
            where: { id },
        });

        return 'Sold item deleted';
    }
}

module.exports = SoldItemService;
