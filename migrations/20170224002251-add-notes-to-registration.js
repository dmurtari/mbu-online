'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Registrations', 'notes', {
      type: Sequelize.STRING
    });
  },

  down: function (queryInterface) {
    queryInterface.removeColumn('Registrations', 'notes');
  }
};
