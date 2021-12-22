/* eslint-disable arrow-body-style */
module.exports = {
    up: async (queryInterface) => {
        return queryInterface.bulkInsert('User', [
            {
                username: 'admin',
                email: 'test@admin.com',
                firstName: 'Admin first',
                middleName: 'Middle',
                lastName: 'Last',
                password: 'admin1234',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
    },

    down: async (queryInterface) => {
        return queryInterface.bulkDelete('User', null, {});
    },
};
