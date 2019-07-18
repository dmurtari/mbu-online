'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('Registrations', 'notes', {
            type: Sequelize.STRING
        });
    },

    down: function (queryInterface) {
        return queryInterface.removeColumn('Registrations', 'notes');
    }
};
