module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('SoldItem', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            price: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            condition: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            size: {
                type: Sequelize.STRING(15),
                allowNull: true,
            },
            imageLocation: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            dateSold: {
                type: Sequelize.DATE,
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
        await queryInterface.dropTable('SoldItem');
    },
};
