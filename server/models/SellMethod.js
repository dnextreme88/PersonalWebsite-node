const Helpers = require('../lib/Helpers');

const helpers = new Helpers();

module.exports = (sequelize, SequelizeDataTypes) => {
    const db = sequelize.models;

    const SELL_METHOD = sequelize.define('SellMethod', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        method: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: false,
            validate: {
                isIn: {
                    args: [['dropping', 'meetup', 'shipment']],
                    msg: 'Method must either be dropping, meetup, or shipment',
                },
                len: {
                    args: [0, 100],
                    msg: 'Method must not exceed 100 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Method cannot be null',
                },
            },
        },
        location: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Location must not exceed 100 characters',
                },
            },
        },
        soldItemId: {
            type: SequelizeDataTypes.INTEGER,
            onDelete: 'set null',
            references: {
                model: 'SoldItem',
                key: 'id',
            },
            validate: {
                async isFound(value) {
                    const soldItem = await db.SoldItem.findByPk(value);
                    if (!soldItem) throw new Error(helpers.addErrorMessage('soldItemId'));
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

    SELL_METHOD.associate = (models) => SELL_METHOD.belongsTo(models.SoldItem, { as: 'soldItem' });

    return SELL_METHOD;
};
