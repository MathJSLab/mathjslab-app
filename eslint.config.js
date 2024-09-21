const globals = require('globals');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');
const imprt = require('eslint-plugin-import');

module.exports = [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
                globals: {
                    ...globals.es2015,
                },
            },
        },
        plugins: {
            import: imprt,
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
        },
        ignores: ['eslint.config.js', 'dist/**'],
        rules: {
            ...tsPlugin.configs['eslint-recommended'].rules,
            ...tsPlugin.configs['recommended'].rules,
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            'no-console': 'warn',
            ...prettierPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
        },
    }
];
