const db = require('../models');

class SoldItemService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const soldItems = await db.SoldItem.findAll({
            include: [
                { model: await db.PaymentMethod },
                { model: await db.SellMethod },
            ],
            order: [['createdAt', 'ASC']],
        });

        return soldItems;
    }

    async getAllByFilter(filterParams) {
        // Check whether we add a WHERE clause if at least one of the values of the filter parameter is greater than 0
        const whereClause = Object.values(filterParams).some((value) => value.length > 0) ? 'WHERE' : '';
        const andClause = ' AND';
        const soldItemAttr = await db.SoldItem.rawAttributes;
        const soldItemFields = [];
        let query;

        Object.keys(soldItemAttr).forEach((fieldKey) => {
            const fieldName = ` "SoldItem"."${fieldKey}"`;
            soldItemFields.push(fieldName);
        });

        // Build query
        query = `SELECT ${soldItemFields} FROM "SoldItem" ${whereClause} `;

        if (filterParams.month) {
            query += `"dateSold" LIKE '%-${filterParams.month}-%'`;
        }
        if (filterParams.year) {
            const appender = filterParams.month ? andClause : '';
            query += `${appender} "dateSold" LIKE '${filterParams.year}%'`;
        }
        if (filterParams.brand) {
            const appender = filterParams.month || filterParams.year ? andClause : '';
            query += `${appender} "name" LIKE '%${filterParams.brand}%'`;
        }
        if (filterParams.type) {
            const appender = filterParams.month || filterParams.year || filterParams.brand ? andClause : '';
            query += `${appender} "name" LIKE '%${filterParams.type}%'`;
        }

        // Run query
        const soldItems = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT });

        return soldItems;
    }

    async getById(id) {
        const soldItem = await db.SoldItem.findByPk(id, {
            include: [
                { model: await db.PaymentMethod },
                { model: await db.SellMethod },
            ],
        });

        return soldItem;
    }

    async createSoldItem(body) {
        const values = {
            name: body.name,
            price: body.price,
            condition: body.condition,
            size: body.size,
            imageLocation: body.imageLocation,
            // There's a bug when replacing dateSold input in SoldItem.js using set()
            dateSold: body.dateSold.replace(/\//g, '-'),
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
