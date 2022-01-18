module.exports = (sequelize, SequelizeDataTypes) => {
    const GUIDE = sequelize.define('Guide', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: false,
            validate: {
                len: {
                    args: [0, 254],
                    msg: 'Name must not exceed 254 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Name cannot be null',
                },
            },
        },
        game: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 254],
                    msg: 'Game must not exceed 254 characters',
                },
            },
        },
        platforms: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: true,
        },
        type: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: true,
        },
        url: {
            type: SequelizeDataTypes.TEXT,
            allowNull: true,
            validate: {
                async startsWith(value) {
                    const startsWith = ['http://', 'https://', 'www.'];

                    const isStartsWith = startsWith.some((text) => value.startsWith(text));
                    if (!isStartsWith) throw new Error('url does not start with either http://, https://, or www.');
                },
            },
        },
        dateCreated: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: true,
            validate: {
                isDate: {
                    args: true,
                    msg: 'Date created must be a date string',
                },
            },
        },
        dateModified: {
            type: SequelizeDataTypes.STRING(254),
            allowNull: true,
            validate: {
                isDate: {
                    args: true,
                    msg: 'Date modified must be a date string',
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
        // Model-wide validations
        validate: {
            isDateModifiedLessThanDateCreated() {
                if (this.dateModified < this.dateCreated) {
                    throw new Error('Date modified cannot be less than date created');
                }
            },
        },
    });

    return GUIDE;
};
