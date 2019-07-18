'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('Users', 'details', {
            type: Sequelize.JSON,
            allowNull: false,
            defaultValue: {}
        });
    },

    down: function (queryInterface) {
        return queryInterface.removeColumn('Users', 'details');
    }
};
