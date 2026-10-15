/** @type {import('jest').Config} */
const tsconfig = '<rootDir>/tsconfig.jest.json';
const transform = { '^.+\\.[cm]?ts$': ['ts-jest', { tsconfig, useESM: true }] };

module.exports = {
    rootDir: '.',
    projects: [
        {
            displayName: 'example-tests',
            testEnvironment: 'jsdom',
            extensionsToTreatAsEsm: ['.ts'],
            testMatch: ['<rootDir>/test/examples/**/*.spec.ts'],
            transform,
        },
        {
            displayName: 'markdown-compatibility-tests',
            testEnvironment: 'jsdom',
            extensionsToTreatAsEsm: ['.ts'],
            moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
            testMatch: ['<rootDir>/test/markdown/**/*.spec.ts'],
            transform,
        },
    ],
};
