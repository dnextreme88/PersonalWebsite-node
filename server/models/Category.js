module.exports = (sequelize, SequelizeDataTypes) => {
    const CATEGORY = sequelize.define('Category', {
        id: {
            type: SequelizeDataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: SequelizeDataTypes.STRING(50),
            allowNull: false,
            unique: { msg: 'Name is already taken' },
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'Name must not exceed 50 characters',
                },
                notNull: {
                    args: true,
                    msg: 'Name cannot be null',
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

    CATEGORY.associate = (models) => CATEGORY.hasMany(models.Post, { foreignKey: 'categoryId' });

    return CATEGORY;
};
