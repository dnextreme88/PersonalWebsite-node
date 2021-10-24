module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('User', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: Sequelize.STRING(100),
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: 'Username cannot be null',
                    },
                },
            },
            email: {
                type: Sequelize.STRING(100),
                validate: {
                    isEmail: {
                        args: true,
                        msg: 'Email is not a valid email address',
                    },
                    len: {
                        args: [0, 100],
                        msg: 'Email must not exceed 100 characters',
                    },
                    notNull: {
                        args: true,
                        msg: 'Email cannot be null',
                    },
                },
                allowNull: false,
                unique: true,
            },
            firstName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            middleName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            lastName: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING(100),
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
        await queryInterface.dropTable('User');
    },
};
