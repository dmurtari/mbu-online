'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('Users', 'approved', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    },

    down: function (queryInterface) {
        return queryInterface.removeColumn('Users', 'approved');
    }
};
