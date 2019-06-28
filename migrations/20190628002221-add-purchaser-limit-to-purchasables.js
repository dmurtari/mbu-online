'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Purchasables', 'purchaser_limit', {
      type: Sequelize.INTEGER,
      validate: {
          min: 0
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Purchasables', 'purchaser_limit');
  }
};
