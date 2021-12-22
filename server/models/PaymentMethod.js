const Helpers = require('../lib/Helpers');

const helpers = new Helpers();

module.exports = (sequelize, SequelizeDataTypes) => {
    const db = sequelize.models;

    const PAYMENT_METHOD = sequelize.define('PaymentMethod', {
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
                    args: [['cash on-hand', 'dropping area cashout', 'remittance']],
                    msg: 'Method must either be cash on-hand, dropping area cashout, or remittance',
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
        remittanceLocation: {
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

    return PAYMENT_METHOD;
};
