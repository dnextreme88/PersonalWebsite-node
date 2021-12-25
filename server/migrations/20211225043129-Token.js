module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Token', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            token: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            isExpired: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: true,
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
        await queryInterface.dropTable('Token');
    },
};
