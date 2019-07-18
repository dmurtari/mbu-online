'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.addColumn('Offerings', 'requirements', {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: []
            }),
            queryInterface.addColumn('Assignments', 'completions', {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
                defaultValue: []
            }),
        ])
    },

    down: function (queryInterface) {
        return Promise.all([
            queryInterface.removeColumn('Offerings', 'requirements'),
            queryInterface.removeColumn('Assignments', 'completions'),
        ]);
    }
};
