const slugify = require('slugify');

module.exports = (sequelize, SequelizeDataTypes) => {
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
                console.log(`===LOG: Setting slug...`);
                console.log(this.title);
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
        categoryId: {
            type: SequelizeDataTypes.INTEGER,
            onDelete: 'set null',
            references: {
                model: 'Category',
                key: 'id',
            },
        },
        userId: {
            type: SequelizeDataTypes.INTEGER,
            onDelete: 'set null',
            references: {
                model: 'User',
                key: 'id',
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

    return POST;
};
