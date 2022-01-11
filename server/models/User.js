module.exports = (sequelize, SequelizeDataTypes) => {
    const USER = sequelize.define('User', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: {
                    args: true,
                    msg: 'Username cannot be null',
                },
            },
        },
        email: {
            type: SequelizeDataTypes.STRING(100),
            validate: {
                isEmail: {
                    args: true,
                    msg: 'Email is not a valid email address',
                },
                len: {
                    args: [0, 100],
                    msg: 'Email must not exceed 100 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Email cannot be null',
                },
            },
            allowNull: false,
            unique: true,
        },
        firstName: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
        },
        middleName: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
        },
        lastName: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
        },
        password: {
            type: SequelizeDataTypes.STRING(100),
            allowNull: true,
        },
        createdAt: {
            type: SequelizeDataTypes.DATE,
            allowNull: true,
        },
        updatedAt: {
            type: SequelizeDataTypes.DATE,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        hooks: {
            afterCreate: (record) => {
                const rec = record;
                delete rec.dataValues.password;
            },
            afterUpdate: (record) => {
                const rec = record;
                delete rec.dataValues.password;
            },
        },
    });

    USER.associate = (models) => {
        USER.hasMany(models.Post, { foreignKey: 'userId' });
        USER.hasMany(models.Token, { foreignKey: 'userId' });
    };

    return USER;
};
