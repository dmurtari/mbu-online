'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Users', 'details', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {}
    });
  },

  down: function (queryInterface) {
    queryInterface.removeColumn('Users', 'details');
  }
};
