const slugify = require('slugify');
const Helpers = require('../lib/Helpers');

const helpers = new Helpers();

module.exports = (sequelize, SequelizeDataTypes) => {
    const db = sequelize.models;

    const POST = sequelize.define('Post', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Title must not exceed 100 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Title cannot be null',
                },
            },
        },
        slug: {
            type: SequelizeDataTypes.STRING(200),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 200],
                    msg: 'Slug must not exceed 200 characters',
                },
            },
            set() {
                this.setDataValue('slug', slugify(this.title, {
                    lower: true,
                    strict: false,
                    remove: /[*+~.()'"!:@]/g,
                }));
            },
        },
        content: {
            type: SequelizeDataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    args: true,
                    msg: 'Content cannot be null',
                },
            },
        },
        date: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: false,
            validate: {
                isDate: {
                    args: true,
                    msg: 'Date must be a date string',
                },
                notNull: {
                    args: true,
                    msg: 'Date cannot be null',
                },
            },
        },
        categoryId: {
            type: SequelizeDataTypes.INTEGER,
            onDelete: 'set null',
            references: {
                model: 'Category',
                key: 'id',
            },
            validate: {
                async isFound(value) {
                    const category = await db.Category.findByPk(value);
                    if (!category) throw new Error(helpers.addErrorMessage('categoryId'));
                },
            },
        },
        userId: {
            type: SequelizeDataTypes.INTEGER,
            onDelete: 'set null',
            references: {
                model: 'User',
                key: 'id',
            },
            validate: {
                async isFound(value) {
                    const user = await db.User.findByPk(value);
                    if (!user) throw new Error(helpers.addErrorMessage('userId'));
                },
            },
        },
        createdAt: {
            type: SequelizeDataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: SequelizeDataTypes.DATE,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
    });

    POST.associate = (models) => {
        POST.belongsTo(models.Category, { as: 'category' });
        POST.belongsTo(models.User, { as: 'user' });
    };

    return POST;
};
