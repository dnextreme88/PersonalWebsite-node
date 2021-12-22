module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('SellMethod', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            method: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            location: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            soldItemId: {
                type: Sequelize.INTEGER,
                onDelete: 'set null',
                references: {
                    model: 'SoldItem',
                    key: 'id',
                },
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
        await queryInterface.dropTable('SellMethod');
    },
};
