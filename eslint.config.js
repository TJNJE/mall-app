import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'public', 'storybook-static', '.storybook']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Slice B: 开启 type-checked 类型感知 lint
    // F2: 指定 tsconfigRootDir，让 typescript-eslint 能正确解析项目（否则报找不到 tsconfig）
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        // F2 修正：typescript-eslint v8 + solution 风格根 tsconfig（仅 references、无 files）
        // 下，project: true 无法把 src/* 匹配到 tsconfig.app.json，会报 "file not found in project"。
        // 改用 projectService（v8 推荐），由 TS 项目服务按 references 自动解析每个文件所属 tsconfig。
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    // F3: 测试文件放宽部分 type-checked 规则（异步测试场景常见误报）
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'src/test/**'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
])
