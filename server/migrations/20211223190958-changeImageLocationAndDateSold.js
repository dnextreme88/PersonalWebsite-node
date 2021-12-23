module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('SoldItem', 'imageLocation', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.changeColumn('SoldItem', 'dateSold', {
            type: Sequelize.STRING(254),
            allowNull: false,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.changeColumn('SoldItem', 'imageLocation', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }),
            queryInterface.changeColumn('SoldItem', 'dateSold', {
                type: Sequelize.DATE,
                allowNull: true,
            }),
        ]);
    },
};