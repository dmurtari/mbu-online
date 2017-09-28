'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Offerings', 'size_limit', {
      type: Sequelize.INTEGER,
      defaultValue: 20
    });
  },

  down: (queryInterface) => {
    queryInterface.removeColumn('Offerings', 'size_limit');
  }
};
