# 前端工程化能力差距分析 · mall-app

> 面向「高级 → 资深 → 架构师」成长路径，对当前 `mall-app` 项目**尚未实现**的前端工程化能力做的一次系统性盘点。
> 所有结论均基于项目实际代码，关键事实附证据文件，便于逐项落地与验收。

---

## 0. 盘点结论

### 0.1 已经做得不错的部分（功能架构层面）

| 能力      | 现状证据                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| 路由      | `react-router v7` + 布局路由 + `Suspense` 懒加载 + `AuthGuard` 守卫（`src/lib/router.tsx`、`src/lib/AuthGuard.tsx`）    |
| 数据层    | `@tanstack/react-query v5` 全局 `QueryClient`，自定义 hook 封装（`useProductList`/`useProductDetail`/`useCreateOrder`） |
| 请求层    | `axios` 实例 + 拦截器（token 注入、`code===0` 解包、统一错误，`src/lib/request.ts`）                                    |
| 状态管理  | `zustand`（`authStore` 含 `hydrate`、`cartStore`），hook 内使用 selector                                                |
| 体验层    | `ErrorBoundary`、`ToastProvider`、`ImportingFallback`、`Skeleton`                                                       |
| 样式/组件 | `Tailwind v4` + `@theme` 设计 token；基础 UI 库（`Button/Card/Input/Modal/...`）                                        |
| 校验      | `zod` schema + `react-hook-form`（已在 `CheckoutPage` 使用）                                                            |
| Mock      | `MSW v2`（订单持久化 localStorage）                                                                                     |
| 分层      | **服务端状态（react-query）与客户端状态（zustand）分离正确** ✅                                                         |

### 0.2 核心判断

> 项目的**功能骨架已经"像样"**，但**工程化（质量保障 / 构建产物 / 交付流水线 / 可观测性 / 架构治理）几乎是空白**。
> 这些空白恰恰是「高级 → 资深 → 架构师」必须补的主战场，也是本项目最佳的练手场。

### 0.3 已核实的事实清单（证据）

- `tsconfig.app.json`：**未开启 `strict`**（仅 `noUnusedLocals`/`noUnusedParameters` 等），类型安全未拉满。
- `eslint.config.js`：仅 `tseslint.configs.recommended`，**未启用 `recommendedTypeChecked` / `strictTypeChecked`**。
- 全仓库 **0 个测试文件**（无 `vitest` / `React Testing Library` / `Playwright`）。
- **0 个 `.env` 文件**，`baseURL` 写死为 `/`（`src/lib/request.ts`），无多环境配置。
- `vite.config.ts`：仅 `react()` + `tailwindcss()` 插件，无 `manualChunks` / `visualizer` / 压缩 / React Compiler。
- 根目录**无 `.github`（CI）**、**无 `.husky`**、**无 Prettier 配置**。
- `AuthGuard`：仅做「是否登录」守卫，**无角色/权限（RBAC）**。
- `api/index.ts`：大量 `as unknown as Promise<X>` 强制断言，绕过 axios 泛型（「假类型安全」）。
- 首页 `ProductListPage`：`ProductCard` 未 `React.memo`，翻页/搜索时整列表重渲染。
- `CLAUDE.md`：严重失真（停留在早期版本，描述「无 Tailwind、内联样式」，与实际不符）。

---

## 1. 工程化能力矩阵（总览）

| 维度           | 现状                                                                | 还缺（生产级）                                              | 对应学习点                |
| -------------- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------- |
| 类型安全       | `noUnusedLocals` 等有，但**未开 `strict`**；ESLint 仅 `recommended` | `strict: true`、eslint `type-checked`、禁止 `any`           | TS 类型体操、类型安全治理 |
| 代码规范自动化 | 只有 ESLint                                                         | **无 Prettier**、无 `lint-staged`+`husky` 提交卡口          | 统一风格、提交门禁        |
| 测试体系       | **0 测试文件**                                                      | 单测(vitest)+组件(RTL)+E2E(Playwright)+覆盖率门禁           | 测试策略、TDD、E2E        |
| 多环境/配置    | `baseURL` 写死 `/`，**0 个 `.env`**                                 | dev/test/staging/prod 多环境、构建变量注入                  | 配置管理、12-factor       |
| 构建产物优化   | Vite 仅 react+tailwind 插件                                         | 分包 `manualChunks`、gzip/brotli、bundle 分析、体积预算     | 构建优化、产物治理        |
| CI/CD          | **无**（无 `.github`）                                              | lint+typecheck+test+build 门禁、预览部署、自动发版          | 流水线设计、DevOps        |
| 提交/版本规范  | 无                                                                  | `commitlint`+约定式提交、`semantic-release`+CHANGELOG       | 工程协作规范              |
| 可观测性       | 无                                                                  | 错误监控(Sentry)、RUM/Web Vitals、业务埋点、日志            | 前端监控体系              |
| 架构治理       | 状态分层**做对了**                                                  | 分层边界管控、设计系统(Storybook)、权限模型(RBAC)、API 契约 | 架构设计、治理            |
| 安全           | token 存 localStorage                                               | httpOnly cookie/CSRF、CSP、依赖安全审计(SCA)                | 前端安全体系              |

---

## 2. 高级前端：把「能跑」变「可靠」

> 当前已会搭功能骨架，差的都是**质量保障**能力。

### 2.1 测试体系（P0，最关键缺口）

- **现状**：全仓库 0 测试；`msw` 已装但仅用于 dev mock，未在测试中使用。
- **应补**：
  - 单元/组件测试：`vitest` + `React Testing Library`。
  - Hook 测试：`renderHook` 覆盖 `useCartStore` 增删改、`useProductList`。
  - 接口测试：在测试里用 MSW 拦截 API，配合 `QueryClientProvider` 包装。
  - 端到端：`Playwright` 覆盖下单主流程。
  - 覆盖率门禁（如 `vitest --coverage`，设定阈值）。
- **学习点**：测试金字塔、TDD、RTL `userEvent`、Mock 策略。

### 2.2 类型严格化

- **现状**：`tsconfig.app.json` 未开 `strict`；`api/index.ts` 用 `as unknown as` 绕过泛型。
- **应补**：
  - `compilerOptions` 加 `"strict": true`。
  - 修正 `src/api/index.ts`，让 `request.get<X>()` 直接返回 `Promise<X>`，去除双重断言。
  - ESLint 升级到 `recommendedTypeChecked` / `strictTypeChecked`，开启 `parserOptions.project`。
- **学习点**：TS 类型系统、泛型、`unknown` vs `any`、类型驱动设计。

### 2.3 规范自动化

- **现状**：仅有 ESLint；无 Prettier、无提交卡口。
- **应补**：
  - 引入 Prettier 并与 ESLint 配合（`eslint-config-prettier` 关掉冲突规则）。
  - `husky` + `lint-staged`：提交时自动格式化 + lint 暂存文件。
- **学习点**：统一代码风格、Git Hooks、提交即校验。

### 2.4 基础性能优化

- **现状**：首页仅图片 `loading="lazy"` + 骨架屏；`ProductCard` 未 `memo`。
- **应补**：
  - `React.memo(ProductCard)` + `useCallback` 包裹搜索/翻页 handler。
  - 开启 **React Compiler**（Vite 一行配置）。
  - 路由级 `prefetchQuery` + `loader` 预取，降低进入下一页的白屏感。
- **学习点**：渲染性能、重渲染分析、编译期优化。

---

## 3. 资深前端：把「可靠」变「可交付」

> 重心从「代码」转向「交付与运行」。

### 3.1 构建产物治理

- **现状**：`vite.config.ts` 仅 `react()` + `tailwindcss()`。
- **应补**：
  - `build.rollupOptions.output.manualChunks` 拆 vendor（react / react-query / zustand 分块）。
  - 开启 brotli/gzip 压缩（`vite-plugin-compression`）。
  - `rollup-plugin-visualizer` 做包体积分析；`size-limit` 设体积预算防止膨胀。
- **学习点**：Rollup 打包原理、产物优化、体积治理。

### 3.2 CI/CD 流水线

- **现状**：无 `.github`，无任何流水线。
- **应补**：
  - `.github/workflows/ci.yml` 串起 `lint → tsc --noEmit → test → build`，PR 挂了不让合。
  - PR 预览部署（Vercel / Netlify Preview）。
  - （进阶）`semantic-release` 自动发版。
- **学习点**：GitHub Actions、流水线设计、DevOps 基础。

### 3.3 提交与版本规范

- **现状**：无。
- **应补**：
  - `commitlint` + Conventional Commits。
  - `semantic-release` 按提交类型自动发版 + 生成 CHANGELOG。
- **学习点**：工程协作规范、语义化版本、自动化发布。

### 3.4 可观测性（错误 / 性能 / 业务）

- **现状**：无全局错误监听、无性能采集、无埋点（`sentry|monitor|track|performance` 全仓库 0 处）。
- **应补**：
  - 错误监控：接入 Sentry（含 SourceMap 上传、白屏检测）。
  - 性能 RUM：`PerformanceObserver` 采集 FCP/LCP/CLS。
  - 业务埋点：封装 `track(event, payload)`；`IntersectionObserver` 做商品曝光、点击进入详情、路由变化自动上报 PV。
  - 统一日志规范。
- **学习点**：前端监控体系、RUM、埋点设计、漏斗分析。

### 3.5 权限与路由治理

- **现状**：`AuthGuard` 仅「是否登录」；无 404 兜底、无路由级 ErrorBoundary。
- **应补**：
  - RBAC：`AuthGuard` 增强为「角色 → 路由/按钮级权限」。
  - 路由补全 `*` 404 兜底页。
  - 路由级 `ErrorBoundary`，避免单页抛错整页白屏兜底。
  - 使用 `react-router v7` 的 `loader`/`action` 做数据预取与表单处理。
- **学习点**：权限模型、路由架构、错误边界分层。

---

## 4. 架构师：把「可交付」变「可规模化 / 可治理」

> 当前项目完全未触及、但决定能否带团队的部分。

### 4.1 架构边界管控

- **现状**：分层靠自觉，无强制约束。
- **应补**：
  - `dependency-cruiser` 或 ESLint 规则**禁止跨层 import**（如 page 不能直接调 axios、feature 不可反向依赖 common）。
  - 把「约定」变成「编译/提交期强制失败」。
- **学习点**：依赖治理、架构约束、技术债防控。

### 4.2 模块化 / 仓库策略

- **现状**：单仓，规模合适。
- **应补（按需）**：
  - 更大时决策 Monorepo（`pnpm workspace`）vs 微前端（`qiankun` / Module Federation），按团队边界取舍。
- **学习点**：模块架构、微前端、仓库治理。

### 4.3 设计系统治理

- **现状**：`common/components/ui` 有雏形，但无文档、无主题、无无障碍审计。
- **应补**：
  - `Storybook` 组件文档 + 视觉回归。
  - Design Token 体系 + 暗黑模式主题切换。
  - 无障碍（a11y）审计（focus-trap、`aria`、键盘可达）。
- **学习点**：设计系统、组件库治理、a11y。

### 4.4 API 契约管理

- **现状**：MSW 全手写 mock，无契约。
- **应补**：OpenAPI 契约 → 自动生成 TS 类型与 mock，前后端解耦。
- **学习点**：接口契约、代码生成、前后端协作。

### 4.5 工程效能度量

- **现状**：无。
- **应补**：把质量门禁**体系化**——覆盖率阈值、构建时长、包体积趋势、Lighthouse CI 预算，作为团队持续度量指标而非一次性配置。
- **学习点**：DevEx（开发者体验）、工程效能度量。

### 4.6 安全与合规体系

- **现状**：token 存 `localStorage`（XSS 风险），无 CSP、无依赖审计。
- **应补**：
  - token 改用 `httpOnly cookie` 或安全 SDK 方案；CSRF 防护。
  - 内容安全策略（CSP）。
  - 依赖安全审计（SCA）、`npm audit` 卡口、敏感信息不进仓库。
- **学习点**：前端安全、合规、依赖治理。

### 4.7 技术规范制定

- **现状**：`CLAUDE.md` 严重失真，会误导后来者。
- **应补**：
  - ADR（架构决策记录），记录关键技术选型与理由。
  - 文档随代码同步更新（当前 `CLAUDE.md` 需重写以反映真实结构）。
- **学习点**：技术领导力、文档治理、决策记录。

---

## 5. 落地优先级建议

| 优先级 | 行动                                                          | 对应层级 | 价值       |
| ------ | ------------------------------------------------------------- | -------- | ---------- |
| P0     | 加 `vitest` + RTL，给 `cartStore`/`useProductList` 写首批测试 | 高级     | 质量底线   |
| P0     | 开 `strict` + 修 `api` 类型断言 + ESLint `type-checked`       | 高级     | 真类型安全 |
| P1     | Prettier + husky + lint-staged 提交卡口                       | 高级     | 协作效率   |
| P1     | 首页 `memo` + 预取 + React Compiler                           | 高级     | 性能体验   |
| P1     | `manualChunks` + 压缩 + 包体积分析                            | 资深     | 产物治理   |
| P1     | GitHub Actions 流水线（lint→typecheck→test→build）            | 资深     | 交付门禁   |
| P1     | Sentry + `PerformanceObserver` + 埋点 SDK                     | 资深     | 可观测性   |
| P1     | RBAC 权限 + 404 + 路由级 ErrorBoundary                        | 资深     | 路由治理   |
| P2     | commitlint + semantic-release + CHANGELOG                     | 资深     | 版本规范   |
| P2     | `dependency-cruiser` 分层约束                                 | 架构师   | 架构治理   |
| P2     | Storybook + 暗黑模式 + a11y                                   | 架构师   | 设计系统   |
| P2     | OpenAPI 契约生成类型/mock                                     | 架构师   | 协作解耦   |
| P2     | 安全体系（cookie/CSP/SCA）+ 效能度量                          | 架构师   | 安全合规   |
| P2     | 重写 `CLAUDE.md` + 建立 ADR                                   | 架构师   | 规范治理   |

---

## 附：如何对照验收

每一项「应补」完成后，建议用以下方式自检：

1. **测试**：`npm run test` 通过且有覆盖率报告。
2. **类型**：`tsc --noEmit` 在 `strict` 下零报错。
3. **规范**：`git commit` 自动触发 lint+format，不合规被拦截。
4. **构建**：`npm run build` 产物含 vendor 分包、gzip/brotli。
5. **CI**：PR 自动跑 lint/typecheck/test/build，失败阻断合并。
6. **可观测**：错误/白屏/性能/埋点数据能在控制台或 Sentry 看到。
7. **治理**：跨层 import 被 lint 拦截；组件有 Storybook 文档。
