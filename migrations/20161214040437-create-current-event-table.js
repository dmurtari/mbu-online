'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable('CurrentEvent', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            created_at: {
                type: Sequelize.DATE
            },
            updated_at: {
                type: Sequelize.DATE
            },
            event_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Events',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            }
        });
    },

    down: function (queryInterface) {
        return queryInterface.dropTable('CurrentEvent');
    }
};
