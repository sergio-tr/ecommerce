import nxPlugin from '@nx/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import domainImportBoundary from './tools/eslint/domain-import-boundary.js';

const nx = nxPlugin.default ?? nxPlugin;

export default [
  {
    ignores: ['dist/**', 'tmp/**', 'node_modules/**', '.nx/**', 'coverage/**', 'docs/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },
    plugins: {
      '@nx': nx,
      '@typescript-eslint': tseslint,
      commercecore: {
        rules: {
          'domain-import-boundary': domainImportBoundary,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'stripe', message: 'Stripe is outside M01-BOOTSTRAP-01.' },
            { name: 'mongodb', message: 'MongoDB is outside M01-BOOTSTRAP-01.' },
            { name: 'mongoose', message: 'MongoDB is outside M01-BOOTSTRAP-01.' },
          ],
          patterns: [
            {
              group: ['@stripe/*', '@kubernetes/*', 'kafkajs'],
              message: 'Provider SDKs are outside M01-BOOTSTRAP-01.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'apps/commercecore-api/**/*.ts',
      'apps/egame-web/**/*.ts',
      'libs/commercecore/catalog/domain/**/*.ts',
      'libs/commercecore/identity/domain/**/*.ts',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: ['layer:domain'],
            },
            {
              sourceTag: 'layer:app',
              onlyDependOnLibsWithTags: ['layer:domain', 'layer:app'],
            },
            {
              sourceTag: 'scope:commercecore',
              notDependOnLibsWithTags: ['scope:commercecloud', 'scope:egame'],
            },
            {
              sourceTag: 'scope:egame',
              onlyDependOnLibsWithTags: ['scope:egame'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/egame-web/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'stripe', message: 'eGame does not call Stripe.' },
            { name: 'mongodb', message: 'eGame does not call MongoDB.' },
            { name: 'mongoose', message: 'eGame does not call MongoDB.' },
          ],
          patterns: [
            {
              group: ['@nestjs', '@nestjs/*'],
              message: 'eGame does not import the NestJS runtime.',
            },
            {
              group: ['@stripe/*', '@kubernetes/*', 'kafkajs'],
              message: 'Provider SDKs stay out of eGame.',
            },
            {
              group: [
                '**/commercecore-api/**',
                '**/catalog/domain/**',
                '**/identity/domain/**',
                '**/commercecloud/**',
              ],
              message: 'eGame keeps its own synthetic DTO.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'libs/commercecore/catalog/domain/**/*.ts',
      'libs/commercecore/identity/domain/**/*.ts',
    ],
    ignores: [
      'libs/commercecore/catalog/domain/**/*.spec.ts',
      'libs/commercecore/identity/domain/**/*.spec.ts',
    ],
    rules: {
      'commercecore/domain-import-boundary': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs', '@nestjs/*'],
              message: 'Pure domain cannot import NestJS.',
            },
            {
              group: ['stripe', '@stripe/*', 'mongodb', 'mongoose', 'kafkajs', '@kubernetes/*'],
              message: 'Pure domain cannot import providers.',
            },
          ],
        },
      ],
    },
  },
];
