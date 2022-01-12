module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('User', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
            },
            firstName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            middleName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            lastName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        },
        {
            freezeTableName: true,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('User');
    },
};
