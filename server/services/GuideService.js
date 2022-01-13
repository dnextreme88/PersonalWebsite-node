/* eslint-disable no-restricted-syntax */
const db = require('../models');

class GuideService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const guides = await db.Guide.findAll({
            order: [['dateCreated', 'ASC']],
        });

        return guides;
    }

    async getAllByFilter(filterParams) {
        // Check whether we add a WHERE clause if at least one of the values of the filter parameter is greater than 0
        const whereClause = Object.values(filterParams).some((value) => value.length > 0) ? 'WHERE' : '';
        const andClause = ' AND';
        const guideAttr = await db.Guide.rawAttributes;
        const guideFields = [];

        Object.keys(guideAttr).forEach((fieldKey) => {
            const fieldName = ` "Guide"."${fieldKey}"`;
            guideFields.push(fieldName);
        });

        let query;

        // Build query
        query = `SELECT ${guideFields} FROM "Guide" AS "Guide" ${whereClause} `;

        if (filterParams.name) {
            query += `"name" ILIKE '%${filterParams.name}%'`;
        }
        if (filterParams.game) {
            const appender = filterParams.name ? andClause : '';
            query += `${appender} "game" ILIKE '%${filterParams.game}%'`;
        }
        if (filterParams.platforms) {
            const appender = filterParams.name || filterParams.game ? andClause : '';
            query += `${appender} "platforms" LIKE '%${filterParams.platforms}%'`;
        }
        if (filterParams.type) {
            const appender = filterParams.name || filterParams.game || filterParams.platforms ? andClause : '';
            query += `${appender} "type" = '${filterParams.type}'`;
        }
        if (filterParams.dateCreated) {
            const appender = filterParams.name || filterParams.game || filterParams.platforms || filterParams.type ? andClause : '';
            query += `${appender} "dateCreated" ${filterParams.dateCreatedOp} '${filterParams.dateCreated}'`;
        }
        if (filterParams.dateModified) {
            const appender = filterParams.name || filterParams.game || filterParams.platforms || filterParams.type || filterParams.dateCreated ? andClause : '';
            query += `${appender} "dateModified" ${filterParams.dateModifiedOp} '${filterParams.dateModified}'`;
        }

        query += ' ORDER BY "Guide"."dateCreated" ASC';

        // Run query
        const guides = await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT });

        return guides;
    }

    async getById(id) {
        const guide = await db.Guide.findByPk(id);

        return guide;
    }

    async createGuide(body) {
        const values = {
            name: body.name,
            game: body.game,
            platforms: body.platforms,
            type: body.type,
            url: body.url,
            dateCreated: body.dateCreated,
            dateModified: body.dateModified,
        };
        const newGuide = await db.Guide.create(values);

        return newGuide;
    }

    async updateGuide(id, body) {
        const guide = await db.Guide.findByPk(id);
        const values = {
            name: body.name ? body.name : guide.name,
            game: body.game ? body.game : guide.game,
            platforms: body.platforms ? body.platforms : guide.platforms,
            type: body.type ? body.type : guide.type,
            url: body.url ? body.url : guide.url,
            dateCreated: body.dateCreated ? body.dateCreated : guide.dateCreated,
            dateModified: body.dateModified ? body.dateModified : guide.dateModified,
        };
        const updatedGuide = await db.Guide.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedGuide[1].dataValues;
    }

    async deleteGuide(id) {
        await db.Guide.destroy({
            where: { id },
        });

        return 'Guide deleted';
    }
}

module.exports = GuideService;
