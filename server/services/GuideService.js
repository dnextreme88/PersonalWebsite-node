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
