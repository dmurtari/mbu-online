const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '.*test\.(ts|tsx)$',
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
        '^.+\\.(css|less)$': '<rootDir>test/cssMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>test/setupTests.js']
};
