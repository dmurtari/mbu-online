'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Users', [{
        email: 'domenic.murtari+admin@gmail.com',
        password: '',
        firstname: 'Domenic',
        lastname: 'Murtari',
        role: 'admin',
        approved: true,
        created_at: new Date(),
        updated_at: new Date()
    }], {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
