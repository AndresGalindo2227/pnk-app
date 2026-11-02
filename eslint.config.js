// @ts-check
const ionic = require('@ionic/eslint-config/recommended');
const angular = require('angular-eslint');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['www/**', 'dist/**', 'coverage/**', '.angular/**', 'android/**', 'ios/**'],
  },
  ionic,
  {
    files: ['**/*.ts'],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'pnk', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'pnk', style: 'kebab-case' }],
      '@angular-eslint/component-class-suffix': ['error', { suffixes: ['Page', 'Component'] }],
    },
  },
  {
    // Layer rule (ADR-001, layers-and-state.md): presentation -> domain <- data.
    // The domain layer is plain TypeScript: no framework, no plugins, no other layer.
    files: ['src/app/features/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@angular/*', '@ionic/*', '@capacitor/*', '@aparajita/*', 'rxjs', 'rxjs/*'],
              message: 'domain/ must not depend on Angular, Ionic, Capacitor or RxJS.',
            },
            {
              group: ['**/data/**', '**/presentation/**', '../data/*', '../presentation/*'],
              message: 'domain/ must not import the data or presentation layers.',
            },
          ],
        },
      ],
    },
  },
  {
    // A feature never reaches into another feature's internals; share through core/ or shared/.
    files: ['src/app/features/*/data/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/presentation/**', '../presentation/*'], message: 'data/ must not import presentation/.' }] },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
