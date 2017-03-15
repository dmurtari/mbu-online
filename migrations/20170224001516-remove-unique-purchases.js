'use strict';

module.exports = {
  up: function (queryInterface) {
    queryInterface.sequelize.query('ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_pkey";');
    queryInterface.removeIndex('Purchases', 'Purchases_pkey');
  },

  down: function (queryInterface) {
    queryInterface.addIndex('Purchases',
      ['purchasable_id', 'registration_id'],
      {
        indexName: 'Purchases_pkey',
        indicesType: 'BTREE'
      }
    );
  }
};
