// Root ESLint configuration for monorepo
// Each workspace (backend, frontend) has its own ESLint config
// This config only covers root-level files

const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.cache/**',
      // Ignore workspace directories - they have their own configs
      'backend/**',
      'frontend/**',
    ],
  },

  // Root-level JavaScript files only
  {
    files: ['*.js', '*.cjs', '*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Prettier integration - disables conflicting rules
  prettier,
];
