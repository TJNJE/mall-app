# CLAUDE.md

本文件为本仓库的开发指导。**内容必须与代码保持同步**——每次新增工程能力或调整架构，需同步更新本文件（S6 文档治理约定）。

## 项目

**mall-app** — React 19 + TypeScript（strict）商城单页应用，用于向有 Vue 基础的开发人员教授 React 生态。数据经 MSW v2 模拟（dev 环境），无真实后端。

## 常用命令

```bash
npm run dev         # Vite 开发服务器（HMR + MSW Mock，dev 自动注册 service worker）
npm run build       # tsc -b 类型检查 + vite build（产物含 gzip，CSP 注入）
npm run lint        # eslint（type-checked，projectService 解析）
npm run test        # vitest 单测（2 文件 6 用例）
npm run coverage    # vitest 覆盖率（v8，text+html）
npm run preview     # 预览生产构建
npm run size        # size-limit 体积预算（200 kB brotli，当前约 156 kB）
npm run cruise      # dependency-cruiser 架构边界检查（CI 同步执行）
npm run gen:api     # 从 docs/api/openapi.yaml 生成 src/api/schema.d.ts
npm run storybook   # Storybook dev（10.6，addon-a11y）
npm run build-storybook
```

## 架构分层与依赖方向（dependency-cruiser 强制）

```text
pages/components（UI） → hooks（服务端状态） 或 stores（客户端状态） → api → request → axios
common/*（通用组件/工具）为被依赖方，禁止依赖 features/*
features/* 之间禁止横向依赖
UI 层禁止直接 import axios
```

规则定义在 `.dependency-cruiser.cjs`，本地 `npm run cruise`，CI 中 Dependency rules 步骤强制。

## 状态管理（详见 docs/adr/0002）

- **服务端状态**：@tanstack/react-query v5。hook 封装于各 feature 的 hooks/，queryKey 工厂导出复用（如 `productDetailQueryKey`，供预取）。
- **客户端状态**：zustand v5。`authStore`（登录态+token）、`cartStore`（购物车）。两者均持久化 localStorage。
- 判断规则：数据来自服务端 → query；纯本地 → store。

## API 契约（S3）

- 契约单一真源：`docs/api/openapi.yaml`（schema 命名与前端域模型同名；响应包装以 `*Envelope` schema 表达）。
- 类型生成：`npm run gen:api` → `src/api/schema.d.ts`（生成物进 git）。
- `src/types/index.ts` 从生成 schema re-export + 少量前端辅助类型（`ApiResponse<T>`/`PaginationParams`）；**不要手写 wire 模型**。
- 新增端点流程：先改 yaml → gen:api → api 层实现 → MSW handler 按契约对齐。

## 测试

- vitest + React Testing Library + MSW（`src/test/setup.ts`）。
- 现有覆盖：`cartStore`（4 用例）、`useProductList`（2 用例，含 keyword 透传）。
- 配置在 `vite.config.ts` 的 `test` 段（jsdom + coverage）。

## 构建与产物（详见 docs/adr/0003）

- 分包：`manualChunks` 函数式分组（react / react-query / router / state / monitoring / vendor）。
- 压缩：gzip（brotli 暂缓，见 control_doc residual）。
- 体积预算：size-limit 200 kB（brotli 后），超限 `npm run size` 失败。
- 体积分析：`ANALYZE=1 npm run build` 生成 `dist/stats.html`（按需，勿常驻）。
- React Compiler 未启用（@vitejs/plugin-react v6 需 reactCompilerPreset + @rolldown/plugin-babel，见 control_doc）。

## CI（.github/workflows/ci.yml）

push/PR 触发：lint → build（含 tsc）→ test → cruise → size → audit（非阻断，官方 registry）。最小权限 + concurrency 取消过期运行。

## 可观测（src/lib/）

`monitor.ts`（Sentry init + 白屏检测）、`perf.ts`（FCP/LCP/CLS，CLS 仅页面隐藏时上报终值）、`track.ts`（埋点出口：商品曝光/路由 PV/白屏）、`logger.ts`（统一日志）。未配置 `VITE_SENTRY_DSN` 时全部退化为 console（见 `.env.example`）。

## 权限与安全

- `AuthGuard` 支持登录态守卫与 `requiredRole`（RBAC）；404/403 兜底页与路由级 `RouteErrorBoundary` 见 `src/lib/router.tsx`。
- RBAC 当前无路由配置 `requiredRole`（能力就位，待后端角色契约），见 control_doc residual。
- token 存储方案决策见 `docs/adr/0001-token-storage.md`（localStorage 现状 + httpOnly cookie 目标）。
- 生产构建注入 CSP（vite.config 的 csp-inject 插件，dev 不注入）。
- commit 经 husky commit-msg 强制 Conventional Commits（type 白名单 + scope 白名单，见 `commitlint.config.cjs`）。

## 已知限制

- MSW mock-only：httpOnly cookie、真实 Sentry 上报（SourceMap）、semantic-release 均需真实后端/发布场景，已 ADR/deferred。
- 暗黑模式已完成机制与首批适配（Header/商品列表），其余页面为亮色硬编码，待批次迁移。
- `src/common/__cruise_canary__.ts`（空文件）与 `src/types/{api,product,order}.ts`（旧类型子文件）为待清理遗留，删除命令见 control_doc。
