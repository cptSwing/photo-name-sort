import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslintPluginTypescript from 'typescript-eslint';
import eslintPluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const config = defineConfig([
    {
        // Acts as global ignore if no other keys (except for 'name')
        name: 'ignores',
        ignores: ['dist', 'node_modules', '.vscode'],
    },

    {
        name: 'js/ts',
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            js: eslintPluginJs,
            '@typescript-eslint': eslintPluginTypescript.plugin,
        },
        extends: ['js/recommended', '@typescript-eslint/recommended'],
        rules: {
            'no-empty': 'off',
            'object-shorthand': 'warn',
            'no-console': 'warn',
            'no-unused-vars': 'off',
            'no-unused-expressions': 'off',
            'no-unreachable': 'warn',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowTernary: true,
                    allowShortCircuit: true,
                },
            ],
        },
    },

    // Prettier last to disable conflicts
    eslintConfigPrettier,
]);

export default config;
