const fs = require('fs');
const path = require('path');

module.exports = {
    up: (queryInterface) => {
        const initialSchemaPath = path.join(__dirname, '..', 'seed', 'initial_schema.sql');
        const initialSchema = fs.readFileSync(initialSchemaPath, 'utf-8');
        return queryInterface.sequelize.query(initialSchema);
    },

    down: (queryInterface) => {
        return Promise.all([
            queryInterface.dropTable('Assignments'),
            queryInterface.dropTable('Badges'),
            queryInterface.dropTable('Events'),
            queryInterface.dropTable('Offerings'),
            queryInterface.dropTable('Preferences'),
            queryInterface.dropTable('Purchasables'),
            queryInterface.dropTable('Purchases'),
            queryInterface.dropTable('Registrations'),
            queryInterface.dropTable('Scouts'),
            queryInterface.dropTable('Users'),
        ]);
    }
};
