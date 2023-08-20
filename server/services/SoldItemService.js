/* eslint-disable no-await-in-loop */
/* eslint-disable no-invalid-this */
/* eslint-disable no-restricted-syntax */
const { Op, Sequelize } = require('sequelize');
const db = require('../models');
const PaymentMethodService = require('./PaymentMethodService');
const SellMethodService = require('./SellMethodService');

const paymentMethods = new PaymentMethodService(this.log);
const sellMethods = new SellMethodService(this.log);

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
            order: [['dateSold', 'ASC']],
        });

        return soldItems;
    }

    async getAllCountAndSumByCondition(type) {
        const conditions = [];

        await db.SoldItem.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('condition')), 'condition'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
            ],
            group: 'condition',
        }).then((result) => {
            result.forEach((soldItem) => {
                if (type === 'count') {
                    conditions.push({ condition: soldItem.dataValues.condition, count: soldItem.dataValues.count });
                } else if (type === 'sum') {
                    conditions.push({ condition: soldItem.dataValues.condition, sum: soldItem.dataValues.sum });
                }
            });
        });

        return conditions;
    }

    async getAllCountAndSumBySize(type) {
        const sizes = [];

        await db.SoldItem.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('size')), 'size'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
            ],
            group: 'size',
        }).then((result) => {
            result.forEach((soldItem) => {
                if (type === 'count') {
                    sizes.push({ size: soldItem.dataValues.size, count: soldItem.dataValues.count });
                } else if (type === 'sum') {
                    sizes.push({ size: soldItem.dataValues.size, sum: soldItem.dataValues.sum });
                }
            });
        });

        return sizes;
    }

    async getAllCountAndSumByYear(type) {
        const currentYear = new Date().getFullYear();
        const years = [];

        for (let year = 2014; year <= currentYear; year++) {
            if (year <= currentYear) {
                await db.SoldItem.findAll({
                    where: { dateSold: { [Op.like]: `${year}-%` } },
                    attributes: [
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                        [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
                    ],
                }).then((soldItem) => {
                    if (type === 'count') {
                        years.push({ year, count: soldItem[0].dataValues.count });
                    } else if (type === 'sum') {
                        years.push({ year, sum: soldItem[0].dataValues.sum });
                    }
                });
            }
        }

        return years;
    }

    async getAllCountAndSumByMonth(type) {
        const monthsTwoDigits = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        const months = [];

        for (let i = 0; i < monthsTwoDigits.length; i++) {
            await db.SoldItem.findAll({
                where: { dateSold: { [Op.like]: `%-${monthsTwoDigits[i]}-%` } },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    [Sequelize.fn('SUM', Sequelize.col('price')), 'sum'],
                ],
            }).then((soldItem) => {
                if (type === 'count') {
                    months.push({ month: monthsTwoDigits[i], count: soldItem[0].dataValues.count });
                } else if (type === 'sum') {
                    months.push({ month: monthsTwoDigits[i], sum: soldItem[0].dataValues.sum });
                }
            });
        }

        return months;
    }

    async getAllByFilter(filterParams) {
        // Check whether we add a WHERE clause if at least one of the values of the filter parameter is greater than 0
        const whereClause = Object.values(filterParams).some((value) => value.length > 0) ? 'WHERE' : '';
        const andClause = ' AND';
        const soldItemAttr = await db.SoldItem.rawAttributes;
        const soldItemFields = [];

        // PaymentMethod and SellMethod fields, used for the includes
        const paymentMethodAttr = await db.PaymentMethod.rawAttributes;
        const paymentMethodFields = [];
        const sellMethodAttr = await db.SellMethod.rawAttributes;
        const sellMethodFields = [];

        const paymentMethodJoin = 'LEFT OUTER JOIN "PaymentMethod" AS "PaymentMethod" ON "SoldItem"."id" = "PaymentMethod"."soldItemId"';
        const sellMethodJoin = 'LEFT OUTER JOIN "SellMethod" AS "SellMethod" ON "SoldItem"."id" = "SellMethod"."soldItemId"';
        let query;

        Object.keys(soldItemAttr).forEach((fieldKey) => {
            const fieldName = ` "SoldItem"."${fieldKey}"`;
            soldItemFields.push(fieldName);
        });
        Object.keys(paymentMethodAttr).forEach((fieldKey) => {
            const fieldName = ` "PaymentMethod"."${fieldKey}" AS "PaymentMethod.${fieldKey}"`;
            paymentMethodFields.push(fieldName);
        });
        Object.keys(sellMethodAttr).forEach((fieldKey) => {
            const fieldName = ` "SellMethod"."${fieldKey}" AS "SellMethod.${fieldKey}"`;
            sellMethodFields.push(fieldName);
        });

        // Build query
        query = `SELECT ${soldItemFields}, ${paymentMethodFields}, ${sellMethodFields} FROM "SoldItem" AS "SoldItem" ${paymentMethodJoin} ${sellMethodJoin} ${whereClause} `;

        if (filterParams.brand) {
            query += `"name" ILIKE '%${filterParams.brand}%'`;
        }
        if (filterParams.type) {
            const appender = filterParams.brand ? andClause : '';
            query += `${appender} "name" ILIKE '%${filterParams.type}%'`;
        }
        if (filterParams.month) {
            const appender = filterParams.brand || filterParams.type ? andClause : '';
            query += `${appender} "dateSold" LIKE '%-${filterParams.month}-%'`;
        }
        if (filterParams.year) {
            const appender = filterParams.brand || filterParams.type || filterParams.month ? andClause : '';
            query += `${appender} "dateSold" LIKE '${filterParams.year}%'`;
        }
        if (filterParams.condition) {
            const appender = filterParams.brand || filterParams.type || filterParams.month || filterParams.year ? andClause : '';
            query += `${appender} "condition" = '${filterParams.condition}'`;
        }
        if (filterParams.size) {
            const appender = filterParams.brand || filterParams.type || filterParams.month || filterParams.year || filterParams.condition ? andClause : '';
            query += `${appender} "size" = '${filterParams.size}'`;
        }
        if (filterParams.paymentMethod) {
            const appender = filterParams.brand || filterParams.type || filterParams.month || filterParams.year || filterParams.condition || filterParams.size ? andClause : '';
            query += `${appender} "PaymentMethod"."method" = '${filterParams.paymentMethod}'`;
        }
        if (filterParams.sellMethod) {
            const appender = filterParams.brand || filterParams.type || filterParams.month || filterParams.year || filterParams.condition || filterParams.size || filterParams.paymentMethod ? andClause : '';
            query += `${appender} "SellMethod"."method" = '${filterParams.sellMethod}'`;
        }

        query += ' ORDER BY "SoldItem"."dateSold" ASC';

        // Run query
        const soldItemsArrOfObjs = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT });
        const soldItemsArray = [];

        for (let i = 0; i < soldItemsArrOfObjs.length; i++) {
            const soldItemObj = {};
            let paymentMethodObj = {};
            let sellMethodObj = {};

            // Remove "PaymentMethod"."insertFieldName" and "SellMethod"."insertFieldName"
            for (const [key, value] of Object.entries(soldItemsArrOfObjs[i])) {
                if (key.startsWith('PaymentMethod')) {
                    const strippedKey = key.split('.')[1];
                    paymentMethodObj[strippedKey] = value;
                } else if (key.startsWith('SellMethod')) {
                    const strippedKey = key.split('.')[1];
                    sellMethodObj[strippedKey] = value;
                } else {
                    soldItemObj[key] = value;
                }
            }

            // Check if a sold item record has null PaymentMethod or SellMethod ids
            if (paymentMethodObj.id === null) {
                paymentMethodObj = { PaymentMethod: null };
            } else {
                paymentMethodObj = { PaymentMethod: { ...paymentMethodObj } };
            }

            if (sellMethodObj.id === null) {
                sellMethodObj = { SellMethod: null };
            } else {
                sellMethodObj = { SellMethod: { ...sellMethodObj } };
            }

            const soldItem = {
                ...soldItemObj,
                ...paymentMethodObj,
                ...sellMethodObj,
            };

            soldItemsArray.push(soldItem);
        }

        return soldItemsArray;
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

    async createSoldItem(body, paymentMethodBody, sellMethodBody) {
        const values = {
            name: body.name,
            price: body.price,
            condition: body.condition,
            size: body.size,
            imageLocation: body.imageLocation,
            notes: body.notes,
            // There's a bug when replacing dateSold input in SoldItem.js using set()
            dateSold: body.dateSold.replace(/\//g, '-'),
        };
        const newSoldItem = await db.SoldItem.create(values);

        const paymentMethodValues = {
            method: paymentMethodBody.paymentMethod,
            remittanceLocation: paymentMethodBody.paymentLocation,
            soldItemId: newSoldItem.id,
        };
        await paymentMethods.createPaymentMethod(paymentMethodValues);

        const sellMethodValues = {
            method: sellMethodBody.sellMethod,
            location: sellMethodBody.sellLocation,
            soldItemId: newSoldItem.id,
        };
        await sellMethods.createSellMethod(sellMethodValues);

        return newSoldItem;
    }

    async updateSoldItem(id, body, paymentMethodBody, sellMethodBody) {
        const soldItem = await db.SoldItem.findByPk(id);
        const values = {
            name: body.name ? body.name : soldItem.name,
            price: body.price ? body.price : soldItem.price,
            condition: body.condition ? body.condition : soldItem.condition,
            size: body.size ? body.size : soldItem.size,
            imageLocation: body.imageLocation ? body.imageLocation : soldItem.imageLocation,
            notes: body.notes ? body.notes : soldItem.notes,
            dateSold: body.dateSold ? body.dateSold.replace(/\//g, '-') : soldItem.dateSold,
        };
        const updatedSoldItem = await db.SoldItem.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        const paymentMethod = await paymentMethods.getBySoldItemId(id);
        const updatedPaymentMethod = await paymentMethods.updatePaymentMethod(paymentMethod.id, paymentMethodBody);

        const sellMethod = await sellMethods.getBySoldItemId(id);
        const updatedSellMethod = await sellMethods.updateSellMethod(sellMethod.id, sellMethodBody);

        const newSoldItem = {
            ...updatedSoldItem[1].dataValues,
            PaymentMethod: updatedPaymentMethod,
            SellMethod: updatedSellMethod,
        };

        return newSoldItem;
    }

    async deleteSoldItem(id) {
        await db.SoldItem.destroy({
            where: { id },
        });

        return 'Sold item deleted';
    }
}

module.exports = SoldItemService;
