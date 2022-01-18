module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Category', 'name', {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await Promise.all([
            queryInterface.changeColumn('Category', 'name', {
                type: Sequelize.STRING(50),
                allowNull: false,
            }),
        ]);
    },
};
