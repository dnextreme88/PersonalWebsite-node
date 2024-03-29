module.exports = (sequelize, SequelizeDataTypes) => {
    const SOLD_ITEM = sequelize.define('SoldItem', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Name must not exceed 100 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Name cannot be null',
                },
            },
        },
        price: {
            type: SequelizeDataTypes.FLOAT,
            allowNull: false,
            validate: {
                isFloat: {
                    args: true,
                    msg: 'Price must be a float or an integer',
                },
                min: {
                    args: 1,
                    msg: 'Price must be greater than or equal to 1',
                },
                notNull: {
                    args: true,
                    msg: 'Price cannot be null',
                },
            },
        },
        condition: {
            type: SequelizeDataTypes.STRING(10),
            allowNull: true,
            validate: {
                isIn: {
                    args: [['healthy', 'new', 'used']],
                    msg: 'Condition must either be healthy, new, used',
                },
                len: {
                    args: [0, 10],
                    msg: 'Condition must not exceed 10 characters',
                },
            },
        },
        size: {
            type: SequelizeDataTypes.STRING(15),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 15],
                    msg: 'Size must not exceed 15 characters',
                },
            },
        },
        imageLocation: {
            type: SequelizeDataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: SequelizeDataTypes.TEXT,
            allowNull: true,
        },
        dateSold: {
            type: SequelizeDataTypes.STRING(15),
            allowNull: true,
            validate: {
                isDate: {
                    args: true,
                    msg: 'Date sold must be a date string',
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

    SOLD_ITEM.associate = (models) => {
        SOLD_ITEM.hasOne(models.PaymentMethod, { foreignKey: 'soldItemId' });
        SOLD_ITEM.hasOne(models.SellMethod, { foreignKey: 'soldItemId' });
    };

    return SOLD_ITEM;
};
