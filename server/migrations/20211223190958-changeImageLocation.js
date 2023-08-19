module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('SoldItem', 'imageLocation', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.changeColumn('SoldItem', 'imageLocation', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }),
        ]);
    },
};
