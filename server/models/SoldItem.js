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
                isIn: {
                    args: [['S', 'M', 'L', 'XL', 'XXL', 'N/A']],
                    msg: 'Size must either be S, M, L, XL, XXL, or N/A',
                },
                len: {
                    args: [0, 15],
                    msg: 'Size must not exceed 15 characters',
                },
            },
        },
        imageLocation: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'Image location must not exceed 100 characters',
                },
            },
        },
        dateSold: {
            type: SequelizeDataTypes.DATE,
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

    return SOLD_ITEM;
};
