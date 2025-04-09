import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // 基础规则配置
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // React 相关配置
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      parser: tseslint.parser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // 自定义规则
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'react/react-in-jsx-scope': 'off',

      // 推荐开启的 React 规则
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unknown-property': 'off',
      'comma-dangle': ['error', 'only-multiline'],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  // Prettier 集成
  {
    rules: {
      ...eslintConfigPrettier.rules,
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          printWidth: 80,
          trailingComma: 'es5',
        },
      ],
    },
  },

  // 全局文件匹配配置
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/*.config.js',
      'esm-cjs',
      '*.json',
      'docs',
      'bin',
      'vendors',
    ],
  }
)
