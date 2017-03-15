'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Users', 'approved', {
     type: Sequelize.BOOLEAN,
     defaultValue: false
   });
  },

  down: function (queryInterface) {
    queryInterface.removeColumn('Users', 'approved');
  }
};
