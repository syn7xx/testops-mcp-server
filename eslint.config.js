import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  ...compat.extends('airbnb-base', 'prettier'),
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      // Project uses ESM-style ".js" specifiers in TS sources (emitted JS keeps them).
      'import/no-unresolved': 'off',
      'import/extensions': 'off',

      // CLI/server logs are intentional.
      'no-console': 'off',

      // Prefer stability over style-only refactors in existing code.
      'prefer-template': 'off',
      'no-nested-ternary': 'off',
      'no-use-before-define': 'off',
      'no-restricted-syntax': 'off',
      'prefer-destructuring': 'off',
      'import/prefer-default-export': 'off',
      'import/order': 'off',
    },
  },
  eslintPluginPrettierRecommended,
];
