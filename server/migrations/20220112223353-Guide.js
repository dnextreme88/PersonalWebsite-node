module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Guide', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING(254),
                allowNull: true,
            },
            game: {
                type: Sequelize.STRING(254),
                allowNull: true,
            },
            platforms: {
                type: Sequelize.STRING(254),
                allowNull: true,
            },
            type: {
                type: Sequelize.STRING(254),
                allowNull: true,
            },
            url: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            dateCreated: {
                type: Sequelize.STRING(254),
                allowNull: true,
            },
            dateModified: {
                type: Sequelize.STRING(254),
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
        await queryInterface.dropTable('Guide');
    },
};
