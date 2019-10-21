'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('Offerings', 'size_limit', {
            type: Sequelize.INTEGER,
            defaultValue: 20
        });
    },

    down: (queryInterface) => {
        return queryInterface.removeColumn('Offerings', 'size_limit');
    }
};
