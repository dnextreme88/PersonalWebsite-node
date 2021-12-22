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
                validate: {
                    len: {
                        args: [0, 100],
                        msg: 'Title must not exceed 100 characters',
                    },
                    notNull: {
                        args: true,
                        msg: 'Title cannot be null',
                    },
                },
            },
            slug: {
                type: Sequelize.STRING(200),
                allowNull: true,
                validate: {
                    len: {
                        args: [0, 200],
                        msg: 'Slug must not exceed 200 characters',
                    },
                },
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                validate: {
                    notNull: {
                        args: true,
                        msg: 'Content cannot be null',
                    },
                },
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
