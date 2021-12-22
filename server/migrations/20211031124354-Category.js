module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Category', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false,
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
        await queryInterface.dropTable('Category');
    },
};
