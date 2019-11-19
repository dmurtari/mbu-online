const { pathsToModuleNameMapper } = require('ts-jest/utils');

module.exports = {
    testRegex: '/.*Spec\.(ts|tsx|js)$',
    moduleFileExtensions: [
        'js',
        'json',
        'vue'
    ],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    transform: {
        '^.+\\.js$': 'babel-jest',
        '^.+\\.vue$': 'vue-jest'
    }
};
