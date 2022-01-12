module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Post', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            slug: {
                type: Sequelize.STRING(200),
                allowNull: true,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            categoryId: {
                type: Sequelize.INTEGER,
                onDelete: 'set null',
                references: {
                    model: 'Category',
                    key: 'id',
                },
            },
            userId: {
                type: Sequelize.INTEGER,
                onDelete: 'set null',
                references: {
                    model: 'User',
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
        await queryInterface.dropTable('Post');
    },
};
