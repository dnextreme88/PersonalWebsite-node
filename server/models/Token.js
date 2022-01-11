const Helpers = require('../lib/Helpers');

const helpers = new Helpers();

module.exports = (sequelize, SequelizeDataTypes) => {
    const db = sequelize.models;

    const TOKEN = sequelize.define('Token', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        token: {
            type: SequelizeDataTypes.TEXT,
            allowNull: true,
        },
        isExpired: {
            type: SequelizeDataTypes.BOOLEAN,
            allowNull: true,
        },
        expiresAt: {
            type: SequelizeDataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: {
                    args: true,
                    msg: 'Expires at must be a date string',
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

    TOKEN.associate = (models) => TOKEN.belongsTo(models.User, { as: 'user' });

    return TOKEN;
};
