# Plan — Phase P0「质量底线」· mall-app 工程化补齐

- **work unit**：Phase P0（依据 `docs/gateflow/control-eng-gaps.md` + `FRONTEND_ENGINEERING_GAPS.md`）
- **branch**：`feat/eng-gaps-implement`
- **gate 位置**：plan → plan-review → implementation → code-review → accept → deepreview → PR
- **slices**：A 测试体系 / B 类型严格化 / C 规范自动化（三者文件基本不重叠，可独立 gate）

---

## 0. Slice 顺序与依赖（互斥性）

| Slice        | 主要改动文件                                                                   | 是否互锁                                         |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| C 规范自动化 | `.prettierrc`、`.husky/pre-commit`、`package.json`、`eslint.config.js`         | 与 A 共同改 `package.json` scripts（见 §4 协调） |
| A 测试体系   | `vitest.config.ts`、`src/test/*`、`*.test.*`、`package.json`                   | 测试文件需通过 B 的 `strict`/`tsc`               |
| B 类型严格化 | `tsconfig.app.json`、`src/lib/http.ts`、`src/api/index.ts`、`eslint.config.js` | 影响全量，最后做，做完需复跑 A 测试              |

**推荐实现顺序**：C → A → B（规范最先、低风险；类型严格化最后，避免反复修复）。
**注意**：A 与 C 都会修改 `package.json` 的 `scripts` / 配置字段，需增量合并，禁止互相覆盖（§4）。

---

## 1. Slice A — 测试体系

### 1.1 新增依赖

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

### 1.2 新增 `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
})
```

### 1.3 新增 `src/test/setup.ts`

```ts
// 关键：axios 在 jsdom 下默认走 XHR adapter，而 msw/node 的 setupServer 只拦截 fetch/http。
// 必须将请求实例切到 fetch adapter，MSW 才能拦截 useProductList 等经 axios 发出的请求（修复 plan-review F1）。
import request from '@/lib/request'
request.defaults.adapter = 'fetch'

import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 1.4 新增 `src/test/handlers.ts`（测试用 MSW，必须返回 `{code,message,data}` 结构，因 `request.ts` 拦截器会解包）

```ts
import { http, HttpResponse } from 'msw'
import { mockGetProducts } from '@/mock/handlers'

export const handlers = [
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword') || undefined
    const { list, total } = mockGetProducts(page, pageSize, keyword)
    return HttpResponse.json({ code: 0, message: 'success', data: { list, total, page, pageSize } })
  }),
]
```

### 1.5 新增 `src/features/cart/stores/cartStore.test.ts`

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from './cartStore'
import type { CartItem } from './cartStore'

const sample: Omit<CartItem, 'quantity'> = {
  productId: 1,
  productName: 'iPhone',
  productImage: '',
  price: 9999,
}

describe('cartStore', () => {
  beforeEach(() => useCartStore.getState().clear())

  it('addItem 新增商品数量为 1', () => {
    useCartStore.getState().addItem(sample)
    const { items, getCount } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0]!.quantity).toBe(1)
    expect(getCount()).toBe(1)
  })

  it('addItem 相同商品累加数量', () => {
    const s = useCartStore.getState()
    s.addItem(sample)
    s.addItem(sample)
    expect(useCartStore.getState().items[0]!.quantity).toBe(2)
    expect(useCartStore.getState().getCount()).toBe(2)
  })

  it('updateQuantity <= 0 时移除该商品', () => {
    const s = useCartStore.getState()
    s.addItem(sample)
    s.updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removeItem / clear 生效', () => {
    const s = useCartStore.getState()
    s.addItem(sample)
    s.removeItem(1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
```

### 1.6 新增 `src/features/product/features/hooks/useProductList.test.tsx`

```tsx
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProductList } from './useProductList'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient()
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useProductList', () => {
  it('成功拉取商品列表', async () => {
    const { result } = renderHook(() => useProductList({ page: 1 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.list.length).toBeGreaterThan(0)
    expect(result.current.data?.total).toBeGreaterThan(0)
  })
})
```

### 1.7 修改 `package.json` — scripts 增加（与 Slice C 的字段合并，见 §4）

```jsonc
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage",
  "preview": "vite preview"
}
```

### 1.8 Slice A 验证（success signal）

```bash
npm run test      # 2 个测试文件通过
npm run coverage  # 生成 text+html 覆盖率报告
```

### 1.9 风险/注意

- `msw/node` 的 `setupServer` 在 jsdom 环境下可用（msw v2 支持 node）。
- `onUnhandledRequest: 'error'` 严格模式；若后续新增接口需在 `src/test/handlers.ts` 补 handler。
- 测试文件也受 Slice B 的 `strict` 约束，B 完成后需复跑 A 仍通过。

---

## 2. Slice B — 类型严格化

### 2.1 修改 `tsconfig.app.json` — 增加 `"strict": true`

在 `compilerOptions` 顶部加入（其余不变）：

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "es2023",
    ...
  }
}
```

### 2.2 新增 `src/lib/http.ts` — 集中消除 `as unknown as`（拦截器已将响应解包为 `data`，此处做唯一一次类型对齐）

```ts
import request from './request'
import type { AxiosRequestConfig } from 'axios'

// 响应拦截器已将返回体解包为 data，这里集中做一次类型断言，
// 使上层 api 获得干净的 Promise<T> 返回类型（消除散落的 as unknown as）。
type TypedRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>
}

const typed = request as unknown as TypedRequest

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return typed.get<T>(url, config)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return typed.post<T>(url, data, config)
}

export const http = { get, post }
```

### 2.3 修改 `src/api/index.ts` — 去除全部 `as unknown as`，改用 `http`

```ts
import { http } from '@/lib/http'
import type {
  CheckoutRequest,
  CheckoutResponse,
  Order,
  OrderListResponse,
  Product,
  ProductListResponse,
} from '@/types'

export function login(username: string) {
  return http.post<{ token: string }>('/api/auth/login', { username })
}

export function getProductList(params: { page?: number; pageSize?: number; keyword?: string }) {
  return http.get<ProductListResponse>('/api/products', { params })
}

export function getProductDetail(id: number) {
  return http.get<Product>('/api/products/' + id)
}

export function createOrder(data: CheckoutRequest) {
  return http.post<CheckoutResponse>('/api/orders', data)
}

export function getOrderList(params: { page?: number; pageSize?: number }) {
  return http.get<OrderListResponse>('/api/orders', { params })
}

export function getOrderDetail(id: string) {
  return http.get<Order>('/api/orders/' + id)
}
```

### 2.4 修改 `eslint.config.js` — 升级 type-checked

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    // 测试文件放宽 type-checked 中不适用于测试框架的规则（修复 plan-review F3）
    files: ['src/test/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
])
```

### 2.5 Slice B 验证（success signal）

```bash
npx tsc -b           # strict 下零报错
npm run lint         # type-checked 下零报错
```

### 2.6 风险/注意

- 开启 `strict` 后 `tsc -b` 可能暴露全量既有类型问题（`strictNullChecks` / `noImplicitAny` 等），实现时运行收集、逐文件修复至零报错。
- `recommendedTypeChecked` 会引入 `no-floating-promises`、`no-misused-promises`、`restrict-template-expressions` 等规则，需同步修复或按团队约定豁免（不默认关规则）。
- `src/lib/http.ts` 是**唯一**保留 `as unknown as` 的位置，属合理封装，不扩散到业务层。

---

## 3. Slice C — 规范自动化

### 3.1 新增依赖

```bash
npm i -D prettier eslint-config-prettier husky lint-staged
```

### 3.2 新增 `.prettierrc`（与现有代码风格对齐：单引号、无分号）

```json
{
  "singleQuote": true,
  "semi": false,
  "printWidth": 100,
  "trailingComma": "all",
  "tabWidth": 2
}
```

### 3.3 新增 `.prettierignore`

```
dist
coverage
node_modules
package-lock.json
```

### 3.4 修改 `eslint.config.js` — 追加 `eslint-config-prettier`（关闭与 prettier 冲突的格式化规则，必须放 extends 末尾）

```js
import prettier from 'eslint-config-prettier'
// extends 末尾追加：
...tseslint.configs.recommendedTypeChecked,
reactHooks.configs.flat.recommended,
reactRefresh.configs.vite,
prettier,
```

### 3.5 新增 `.husky/pre-commit`

```sh
npx lint-staged
```

> 创建方式：`npx husky init` 生成模板后，将内容改为 `npx lint-staged`。

### 3.6 修改 `package.json`（与 Slice A 的 scripts 合并，见 §4）

```jsonc
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "format": "prettier --write .",
  "prepare": "husky",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage",
  "preview": "vite preview"
},
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}
```

### 3.7 Slice C 验证（success signal）

```bash
npm run format    # 全仓一次性统一格式（首跑提交一次）
git commit        # 触发 husky pre-commit → lint-staged 对暂存文件 lint+format
```

### 3.8 风险/注意

- `prepare: "husky"` 在 `npm install` 时初始化 husky；CI/容器环境若无 git 可能失败，可改为 `husky || true`（按需）。
- 首跑 `npm run format` 会改动大量历史文件，建议单独提交，避免与功能改动混在一起。
- `eslint --fix` 与 `prettier --write` 顺序在 lint-staged 中为先 lint 后 format，配合 `eslint-config-prettier` 不冲突。

---

## 4. `package.json` 合并协调（A 与 C 互锁点）

A 与 C 都改 `package.json`，实现时**增量合并**为最终形态：

```jsonc
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "format": "prettier --write .",
  "prepare": "husky",
  "test": "vitest run",
  "test:watch": "vitest",
  "coverage": "vitest run --coverage",
  "preview": "vite preview"
},
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}
```

两 slice 各自实现时只补齐自己负责的字段，不得整体覆盖导致另一方改动丢失。

---

## 5. 不做的过度设计（本轮排除）

- 不为测试引入快照测试 / E2E（Playwright 属 P1）。
- 不为 Slice B 做全量架构重构，仅修复 `strict` / `type-checked` 暴露的**真问题**。
- Slice C 不强制全量 prettier 历史格式化（仅 lint-staged 增量 + 一次性 `format` 提交）。
- 不引入 `commitlint` / Conventional Commits（属 P1）。
- 不触及构建分包 / CI / 可观测 / 权限（属 P1 / P2）。

---

## 6. 整体验证（Phase P0 完成门禁）

```bash
npm run test     # 全部单测通过 + 覆盖率报告
npx tsc -b       # strict 下零报错
npm run lint     # type-checked + prettier 规则下零报错
npm run build    # 构建通过
git commit       # husky + lint-staged 自动 lint/format 暂存文件
```

## 7. 回滚

- 任一 slice 验证失败：git revert 该 slice 提交，回到上一个已 accept 的 slice 状态。
- `strict` 引发不可控回归：先回退 `tsconfig.app.json` 的 `strict`，保留 `src/lib/http.ts` 类型化封装（独立收益），后续单独排期修复。
