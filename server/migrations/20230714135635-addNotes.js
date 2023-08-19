module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('SoldItem', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.removeColumn('SoldItem', 'notes', {
                type: Sequelize.TEXT,
                allowNull: true,
            }),
        ]);
    },
};
