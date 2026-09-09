# Phase 2 (P1) 工程化能力补齐 · 实施计划

> 真源：`FRONTEND_ENGINEERING_GAPS.md` §3（P1 行）+ `docs/gateflow/control-eng-gaps.md` §Phase 2
> 工作分支：`feat/eng-gaps-implement`（非 protected trunk）
> 本 plan 仅描述方案与契约，不修改任何 source/test/config；逐 slice 走 `implementation → code review → commit`。
> 推进方式：5 个 slice 全范围逐 slice 推进（用户已确认）。

## 0. 现状证据总览（已逐一核实）

| 项                   | 现状                                                                      | 证据                                                           |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `ProductCard`        | 普通函数组件，未 `React.memo`，每次父组件重渲染整列表重渲染               | `src/features/product/features/pages/ProductListPage.tsx:7-40` |
| 卡片内 `useNavigate` | 卡片内部调用 `useNavigate` 闭包，memo 后仍需稳定 `onOpen` 才能生效        | `ProductListPage.tsx:12`                                       |
| 搜索/翻页 handler    | `handleSearch` / `onPageChange={(p)=>setPage(p)}` 每次渲染重建，击穿 memo | `ProductListPage.tsx:118-121, 171`                             |
| React Compiler       | 未启用（`vite.config.ts` 仅 `react()`+`tailwindcss()`）                   | `vite.config.ts:8`                                             |
| 路由预取             | 全仓库 0 处 `prefetchQuery`/`loader`                                      | grep 0 命中                                                    |
| 构建分包/压缩        | 无 `manualChunks`/`compression`/`visualizer`                              | `vite.config.ts` 全文                                          |
| CI                   | 无 `.github`                                                              | 根目录无 `.github`                                             |
| 可观测               | 全仓库 0 处 `sentry`/`PerformanceObserver`/`IntersectionObserver`/`track` | grep 0 命中                                                    |
| `AuthGuard`          | 仅 `isAuthenticated` 守卫，无角色                                         | `src/lib/AuthGuard.tsx:4-13`                                   |
| `User` 类型          | 无 `role` 字段                                                            | `src/features/auth/types/index.ts:1-5`                         |
| 404 兜底             | 路由无 `*` 路由                                                           | `src/lib/router.tsx:34-76`                                     |
| 路由级 ErrorBoundary | 仅 `App` 层全局一个                                                       | `src/App.tsx` + `src/common/components/ErrorBoundary.tsx`      |
| `QueryClient`        | 全局单例，`staleTime` 5min                                                | `src/lib/query.tsx`                                            |
| 测试基础设施         | `vitest`+`RTL`+`MSW` 已就绪（Phase 1）                                    | `src/test/setup.ts`、`package.json` scripts                    |
| `build` 脚本         | `tsc -b && vite build`（已含类型检查）                                    | `package.json:8`                                               |

## 1. 全局约定

- 新增 npm 依赖统一经 `npm i -D`（构建/CI/可观测类）或 `-S`（运行时 SDK），写入 `package.json`，不引入 Monorepo / 微前端。
- 所有新增 SDK/工具以 `src/lib/*` 或 `src/common/components/*` 落地，复用既有分层（page → hook → api → request）。
- 不触碰 Phase 1 已交付契约（`strict` / type-checked ESLint / Prettier / husky / 测试）。
- 所有新增环境变量以 `VITE_` 前缀、经 `import.meta.env` 读取，真实密钥不进仓库（仅提交 `.env.example`）。

================================================================

## S1 性能优化

================================================================

### goal / motivation

首页 `ProductCard` 在搜索/翻页时随父组件整列表重渲染；无编译期优化与路由预取，进入详情/下一页有白屏感。

### success signal

- `ProductCard` 在父组件重渲染且 `product`/`onOpen` 不变时不重渲染（memo 生效）。
- `npm run build` 在启用 React Compiler 后无报错。
- 详情页进入前数据已在缓存中（hover 预取命中）。

### non-goals

- 不引入虚拟列表（数据量小，过度设计）。
- 不改 MSW mock 延迟逻辑。

### first-principles judgment + 代码证据

- 重渲染根因：`ProductCard` 是普通函数组件（`ProductListPage.tsx:7`），父组件 `handleSearch`/`setPage` 触发 `ProductListPage` 重渲染，所有卡片无 memo 屏障，全部重渲染。
- 搜索/翻页 handler 在每次渲染重建（`ProductListPage.tsx:118-121, 171`），作为 prop 下传会击穿 memo。
- React Compiler：`vite.config.ts` 仅 `react()`+`tailwindcss()`，未开 compiler（`vite.config.ts:8`）。
- 预取：全仓库 0 处 `prefetchQuery`/`loader`；`useProductDetail` 已存在（`src/features/product/hooks/useProductDetail.ts`）。

### affected files / modules

- `src/features/product/features/pages/ProductListPage.tsx`（memo + useCallback + onOpen 下传 + hover 预取）
- `vite.config.ts`（React Compiler 启用）
- `src/features/product/hooks/useProductDetail.ts`（导出 `productDetailQueryKey(id)` 与 fetcher，供预取复用）

### contract / public-interface changes

- `ProductCard` 签名变更：`{ product, onOpen }`，移除内部 `useNavigate`（由父组件注入稳定 `onOpen`）。
- `useProductDetail` 新增导出 `productDetailQueryKey`（不改变 hook 行为）。

### implementation decisions

1. `ProductCard` 加 memo，移除内部导航：
   ```tsx
   // ProductListPage.tsx
   const ProductCard = React.memo(function ProductCard({
     product,
     onOpen,
   }: {
     product: { id: number; name: string; price: number; image: string; tags?: string[] }
     onOpen: (id: number) => void
   }) {
     return (
       <div
         className="..."
         onClick={() => onOpen(product.id)}
         onMouseEnter={() =>
           queryClient.prefetchQuery({
             queryKey: productDetailQueryKey(product.id),
             queryFn: productDetailFetcher,
           })
         }
       >
         ...
       </div>
     )
   })
   ```
2. 父组件用 `useCallback` 提供稳定 `onOpen`，并注入 `queryClient`：
   ```tsx
   const queryClient = useQueryClient()
   const navigate = useNavigate()
   const onOpen = useCallback((id: number) => navigate(`/product/${id}`), [navigate])
   // ...
   {
     products.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} />)
   }
   ```
3. React Compiler 启用（`vite.config.ts`）：为 `@vitejs/plugin-react` 增加 `reactCompiler: true` 选项（v6 支持）；若所用版本不支持，则安装 `@babel/plugin-react-compiler` 并在 babel 配置中启用（实现时确认 API）。
4. `useProductDetail.ts` 提取 `export const productDetailQueryKey = (id:number) => ['product', id] as const` 与 `export const productDetailFetcher = (id:number) => ...`，hook 内部复用。

### tests / validation

- `npm run build` 通过（React Compiler 启用无报错）。
- 可选 RTL 测试：渲染 `ProductListPage`，`fireEvent.click` 卡片断言 `onOpen` 被调用；memo 行为以构建/手动验证为主。

### completion signal / stop condition

- 构建通过；`ProductCard` 经 `React.memo` 包裹且 `onOpen` 稳定；hover 触发 `prefetchQuery`。

================================================================

## S2 构建产物治理

================================================================

### goal / motivation

`vite.config.ts` 仅 `react()`+`tailwindcss()`，产物无分包、无压缩、无体积分析，无法治理包体积膨胀。

### success signal

- `npm run build` 产物含独立 vendor chunk（react / react-query / react-router / zustand 分离）。
- `dist` 含 `.gz` / `.br` 压缩文件。
- 生成 `stats.html` 包体积可视化；`npm run size` 输出体积预算结果。

### non-goals

- 不引入 CDN 外链、不做微前端分包。

### first-principles judgment + 代码证据

- `vite.config.ts` 无 `build.rollupOptions.output.manualChunks`、无压缩/可视化插件（全文核实）。
- `package.json` devDependencies 无 `vite-plugin-compression` / `rollup-plugin-visualizer` / `size-limit`。

### affected files / modules

- `vite.config.ts`
- `package.json`（新增 devDeps + `size` script）
- 新增 `.env` 无关；新增 `size-limit` 配置（写入 `package.json` 或 `size-limit.json`）

### contract / public-interface changes

- 无公共 API 变更；仅构建产物结构变化。

### implementation decisions

1. `manualChunks` 分包：
   ```ts
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           react: ['react', 'react-dom'],
           'react-query': ['@tanstack/react-query'],
           'react-router': ['react-router-dom'],
           zustand: ['zustand'],
         },
       },
     },
   }
   ```
2. 安装 `vite-plugin-compression`（含 gzip + brotli 两种）并加入 `plugins`：
   ```ts
   import viteCompression from 'vite-plugin-compression'
   plugins: [
     react(),
     tailwindcss(),
     viteCompression(),
     viteCompression({ algorithm: 'brotliCompress' }),
   ]
   ```
3. 安装 `rollup-plugin-visualizer`，`build` 时生成 `stats.html`：
   ```ts
   import { visualizer } from 'rollup-plugin-visualizer'
   // plugins 末尾加 visualizer({ filename: 'stats.html', open: false })
   ```
4. 安装 `size-limit` + `@size-limit/preset-app`，`package.json` 加：
   ```json
   "size-limit": [{ "path": "dist/assets/*.js", "limit": "500 kB" }],
   "scripts": { "size": "size-limit" }
   ```

### tests / validation

- `npm run build` 成功；检查 `dist/assets/` 出现 `react-*.js`、`react-query-*.js` 等独立 chunk 与 `.gz`/`.br` 文件。
- `npm run size` 在预算内通过。

### completion signal / stop condition

- 分包 + 压缩 + 可视化 + 体积预算四项齐备；`npm run size` 通过。

================================================================

## S3 CI/CD 流水线

================================================================

### goal / motivation

根目录无任何 CI，无法在 PR 阶段拦截 lint/typecheck/test/build 失败。

### success signal

- `.github/workflows/ci.yml` 在 `pull_request` / `push` 到 trunk 时自动跑 `lint → typecheck → test → build`，任一步失败阻断。
- 本地 `npm run lint && npm run build && npm run test` 全绿（等价 CI 本地模拟）。

### non-goals

- 不接入预览部署平台（Vercel/Netlify）真实凭据；仅在注释中给出示例。
- 不配置 `semantic-release`（属 Phase 3）。

### first-principles judgment + 代码证据

- 根目录无 `.github`（`ls` 核实）。
- `package.json` 已具备 `lint` / `build`(含 `tsc -b`) / `test` 脚本，可直接复用。

### affected files / modules

- 新增 `.github/workflows/ci.yml`

### contract / public-interface changes

- 无代码 API 变更；新增仓库 CI 配置。

### implementation decisions

```yaml
name: CI
on:
  push:
    branches: [master, main]
  pull_request:
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run build # 已含 tsc -b 类型检查
      - run: npm run test
```

- `build` 已含 `tsc -b`，故无需单独 typecheck job（避免重复）；若需独立 typecheck 可拆 `npx tsc -b --noEmit` 等价步骤。
- 预览部署示例以注释形式保留（不启用 secrets）。

### tests / validation

- CI 配置语法正确性（可本地 `act` 或 YAML lint 校验）。
- 真实校验在 push 后 GitHub Actions 跑通；本地以 `npm run lint && npm run build && npm run test` 模拟。

### completion signal / stop condition

- 配置提交后，新建 PR 触发 CI 且四步全绿（本地模拟命令全绿亦可视为完成信号，CI 远端绿为最终确认）。

================================================================

## S4 可观测性（错误 / 性能 / 业务）

================================================================

### goal / motivation

全仓库 0 处 `sentry`/`PerformanceObserver`/`IntersectionObserver`/`track`，线上错误、性能、业务行为完全不可见。

### success signal

- 错误监控：Sentry 接入，错误/白屏可上报（无 DSN 时仅 warn 不崩溃）。
- 性能 RUM：`PerformanceObserver` 采集 FCP/LCP/CLS 并上报。
- 业务埋点：`track(event, payload)` 可用；商品曝光（IntersectionObserver）、路由变化 PV 自动上报。

### non-goals

- 不搭建完整告警体系/看板；仅完成 SDK 接入与数据出口。
- 不接真实 Sentry 项目（用 env 占位）。

### first-principles judgment + 代码证据

- grep 全仓库 `sentry|track|performance|observer` 0 命中，印证无监控。
- `package.json` devDeps 无 `@sentry/*`。

### affected files / modules

- 新增 `src/lib/monitor.ts`（Sentry init）
- 新增 `src/lib/perf.ts`（PerformanceObserver 封装）
- 新增 `src/lib/track.ts`（埋点 SDK `track()`）
- 新增 `src/lib/logger.ts`（统一日志）
- `src/main.tsx` 接入 monitor 初始化
- `src/App.tsx` 或路由层接入路由 PV（useLocation effect）
- `ProductCard`（S1 已改）加曝光 `track`
- 新增 `.env.example`（VITE_SENTRY_DSN 占位）

### contract / public-interface changes

- 新增公共函数：`track(event: string, payload?: Record<string, unknown>)`、`initMonitor()`、`reportWebVitals()`、`logger`。
- 不影响现有业务 hook 签名。

### implementation decisions

1. `src/lib/monitor.ts`：
   ```ts
   import * as Sentry from '@sentry/react'
   export function initMonitor() {
     const dsn = import.meta.env.VITE_SENTRY_DSN
     if (!dsn) {
       console.warn('[monitor] no VITE_SENTRY_DSN, skip Sentry')
       return
     }
     Sentry.init({ dsn, integrations: [Sentry.browserTracingIntegration()], tracesSampleRate: 0.1 })
   }
   ```
2. `src/lib/perf.ts`：`PerformanceObserver` 监听 `paint`/`largest-contentful-paint`/`layout-shift`，聚合后 `track('web_vitals', metrics)` 或 `Sentry.captureEvent`。
3. `src/lib/track.ts`：
   ```ts
   export function track(event: string, payload?: Record<string, unknown>) {
     // 最小实现：sendBeacon 到 VITE_TRACK_ENDPOINT 或 Sentry.captureEvent
     if (import.meta.env.VITE_SENTRY_DSN) Sentry.captureEvent({ message: event, extra: payload })
   }
   ```
4. `ProductCard` 曝光：IntersectionObserver 首次可见 `track('product_exposure', { id })`（在 S1 的 `ProductCard` 内加 `ref` + observer，或独立 hook `useExposure`）。
5. 路由 PV：`src/App.tsx` 内 `const { pathname } = useLocation(); useEffect(() => track('page_view', { path: pathname }), [pathname])`。
6. `src/lib/logger.ts`：包装 `console` + 错误时 `Sentry.captureException`，统一前缀。
7. `src/main.tsx` 顶部 `initMonitor()`；`.env.example` 增加 `VITE_SENTRY_DSN=` / `VITE_TRACK_ENDPOINT=`。

### tests / validation

- `npm run build` 通过。
- dev 启动后 console 验证：`initMonitor` 无 DSN 时仅 warn；点击/滚动产生 `track` 调用（可在 `track` 内临时 `console.debug` 验证）。
- 可选单测：`track` 在无 Sentry 时不抛错。

### completion signal / stop condition

- 四个模块就位且 `npm run build` 通过；无 DSN 场景下应用正常启动不崩溃。

================================================================

## S5 权限与路由治理

================================================================

### goal / motivation

`AuthGuard` 仅「是否登录」；无角色、无 404 兜底、无路由级 ErrorBoundary，单页抛错会整页白屏。

### success signal

- RBAC：`AuthGuard` 支持 `requiredRole`，无权限跳转 403/登录。
- 404：`*` 路由渲染 `NotFoundPage`。
- 路由级 ErrorBoundary：单页抛错被局部兜底，不整页白屏。

### non-goals

- 不接后端真实权限接口；mock 用户带 `role` 演示。
- 不实现细粒度按钮权限平台，仅提供 `useCan`/`RoleGuard` 最小能力。

### first-principles judgment + 代码证据

- `AuthGuard.tsx:4-13` 仅 `isAuthenticated`，无 role。
- `User` 类型无 `role`（`src/features/auth/types/index.ts:1-5`）。
- 路由无 `*`（`router.tsx:34-76`）；仅 `App` 全局 ErrorBoundary。

### affected files / modules

- `src/features/auth/types/index.ts`（User 加 `role`）
- `src/features/auth/stores/authStore.ts`（login 后写入 role；mock 提供 role）
- `src/mock/handlers.ts`（登录响应带 role）
- `src/lib/AuthGuard.tsx`（requiredRole）
- `src/lib/router.tsx`（`*` 404 + 路由级 ErrorBoundary 包裹）
- 新增 `src/common/components/RouteErrorBoundary.tsx`
- 新增 `src/features/*/pages/NotFoundPage.tsx`（或 `src/common/pages/`）
- 新增 `src/common/auth/RoleGuard.tsx`（按钮级权限，可选）

### contract / public-interface changes

- `User.role: 'admin' | 'user'` 新增字段（向后兼容：mock/store 补齐）。
- `AuthGuard` props 新增可选 `requiredRole?: 'admin' | 'user'`。

### implementation decisions

1. `User` 加 `role: 'admin' | 'user'`；`authStore.login` 返回的 user 含 role（mock handlers 登录响应加 `role: 'user'`）。
2. `AuthGuard` 增强：
   ```tsx
   export default function AuthGuard({
     children,
     requiredRole,
   }: {
     children: React.ReactNode
     requiredRole?: 'admin' | 'user'
   }) {
     const { isAuthenticated, user } = useAuthStore()
     if (!isAuthenticated) return <Navigate to="/login" replace />
     if (requiredRole && user?.role !== requiredRole) return <Navigate to="/403" replace />
     return <>{children}</>
   }
   ```
3. `router.tsx` 增加 `*` 路由 → `NotFoundPage`；每个受保护路由外层用 `RouteErrorBoundary` 包裹 `PageWrapper`：
   ```tsx
   <Route path="*" element={<NotFoundPage />} />
   // 包裹示例：
   <RouteErrorBoundary><PageWrapper .../></RouteErrorBoundary>
   ```
4. `RouteErrorBoundary`：基于现有 `ErrorBoundary` 复制为路由级，fallback 显示「页面出错」+ 重试。
5. `RoleGuard`（可选）：`<RoleGuard role="admin"><Button/></RoleGuard>` 无权限时不渲染子节点。

### tests / validation

- `npm run build` 通过。
- 可选 RTL：`render` `AuthGuard` 无 role 用户 + `requiredRole="admin"` → 断言重定向到 `/403`；`*` 路由渲染 `NotFoundPage`。

### completion signal / stop condition

- RBAC + 404 + 路由级 ErrorBoundary 三项齐备；`npm run build` 通过。

================================================================

## 全局 docs decision

================================================================

- `CLAUDE.md` 当前失真（§0.3 已记），**不在 Phase 2 重写**（属 Phase 3 文档治理），但 Phase 2 新增能力（CI/可观测/权限）的简要说明在 closeout 文档中记录，供 Phase 3 统一同步。
- 不新增独立 docs 文件（除 `.github/workflows/ci.yml`、`.env.example` 配置类）。

## 全局 risks / open questions（residual risk 分类）

| 风险 / 开放问题                                                         | 分类                    | 去向                                 |
| ----------------------------------------------------------------------- | ----------------------- | ------------------------------------ |
| React Compiler 与 `@vitejs/plugin-react` v6 的具体启用 API 需实现时确认 | covered-by-later-slice  | S1 实现时确认，失败回退 babel plugin |
| Sentry DSN / track endpoint 无真实值，仅占位验证                        | assigned-to-later-phase | Phase 3 安全/治理补齐真实接入        |
| CI 远端绿需在 GitHub 跑，本地仅能模拟                                   | covered-by-later-slice  | push 后 PR 验证                      |
| RBAC 后端契约未定，仅前端演示                                           | assigned-to-later-phase | 后端联调时对齐                       |
| `size-limit` 阈值 500kB 为初值，可能需调                                | needs-more-evidence     | 构建后据 stats.html 调整             |

## completion report format

每个 slice 完成后报告：slice id、改动文件清单、validation 结果（命令+输出摘要）、residual risk 状态、commit hash。

## 为何未过度设计

- 仅补齐 gap 文档 P1 列出的能力，每项取「最小可用」实现（Sentry 仅接入、CI 仅四步、权限仅前端演示）。
- 不引入 Monorepo/微前端、不重写架构、不做生产级告警/看板（留 Phase 3）。
- 每个 slice 独立可验证、可回滚，scope 严格限定在 Phase 2 五能力内。
