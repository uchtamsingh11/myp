module.exports = {
        extends: [
                'eslint:recommended',
                'next/core-web-vitals',
                'plugin:prettier/recommended',
        ],
        plugins: ['prettier'],
        parserOptions: {
                ecmaVersion: 2023,
                sourceType: 'module',
                ecmaFeatures: {
                        jsx: true,
                },
        },
        rules: {
                'prettier/prettier': 'error',
                'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
                'react/react-in-jsx-scope': 'off',
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'warn',
                'no-console': ['warn', { allow: ['error', 'warn'] }],
        },
        env: {
                browser: true,
                node: true,
                es6: true,
        },
        settings: {
                react: {
                        version: 'detect',
                },
        },
}; 