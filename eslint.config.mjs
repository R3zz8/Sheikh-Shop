import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,

  {
    rules: {
      // 🔒 Security rules (Enabled)
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'warn',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'warn',

      // ⚛️ React rules (Standard legacy code compatibility mode)
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'warn',
      'react/jsx-no-target-blank': 'warn',
      'react/jsx-key': 'warn',
      'react/no-array-index-key': 'warn',
      'react/no-danger': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',

      // Next.js specific rules
      '@next/next/no-img-element': 'warn',
      'jsx-a11y/alt-text': 'warn',

      // 📦 General logic rules
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-duplicate-imports': 'warn',
      'no-useless-return': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-rename': 'warn',
      'object-shorthand': 'warn',
      'prefer-template': 'warn',

      // ⚠️ React Compiler / react-hooks v6.1+ rules (Disabled to prevent compile failures on existing production code)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/component-hook-factories': 'off',
      'react-hooks/config': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/gating': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },

  // 📌 Relax rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'no-console': 'off',
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
  ]),
]);

export default eslintConfig;
