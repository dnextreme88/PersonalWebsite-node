module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Post', 'date', {
            type: Sequelize.STRING(254),
            allowNull: false,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.removeColumn('Post', 'date', {
                type: Sequelize.STRING(254),
                allowNull: false,
            }),
        ]);
    },
};
