'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn('Purchasables', 'maximum_age', {
                type: Sequelize.INTEGER
            }),
            queryInterface.addColumn('Purchasables', 'minimum_age', {
                type: Sequelize.INTEGER
            }),
            queryInterface.addColumn('Purchasables', 'has_size', {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            }),
        ]);
    },

    down: function (queryInterface) {
        return Promise.all([
            queryInterface.removeColumn('Purchasables', 'maximum_age'),
            queryInterface.removeColumn('Purchasables', 'minimum_age'),
            queryInterface.removeColumn('Purchasables', 'has_size'),
        ]);
    }
};
