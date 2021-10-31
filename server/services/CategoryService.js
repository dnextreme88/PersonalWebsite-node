const db = require('../models');

class CategoryService {
    constructor(log) {
        this.log = log;
    }

    async getAll() {
        const categories = await db.Category.findAll({
            order: [['createdAt', 'ASC']],
        });

        return categories;
    }

    async getById(id) {
        const category = await db.Category.findByPk(id);

        return category;
    }

    async createCategory(body) {
        const values = { name: body.name };
        const newCategory = await db.Category.create(values);

        return newCategory;
    }

    async updateCategory(id, body) {
        const values = { name: body.name };
        const updatedCategory = await db.Category.update(values, {
            where: { id },
            returning: true,
            plain: true,
        });

        return updatedCategory[1].dataValues;
    }

    async deleteCategory(id) {
        await db.Category.destroy({
            where: { id },
        });

        return 'Category deleted';
    }
}

module.exports = CategoryService;
