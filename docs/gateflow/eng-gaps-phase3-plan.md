# Phase 3 (P2) 治理能力补齐 · 实施计划

> 真源：`FRONTEND_ENGINEERING_GAPS.md` §3.3 / §4.1 / §4.3 / §4.4 / §4.6 / §4.7 + §5 P2 行
> 总控：`docs/gateflow/control-eng-gaps.md` §Phase 3（[pending] → 本次启动）
> 工作分支：`feat/eng-gaps-implement`（延续，非 protected trunk）
> 推进方式：6 个 slice 全范围逐 slice 推进（用户已确认），与 Phase 2 同模式。

## 0. 现状证据总览（2026-09-09 逐一核实）

| 项                | 现状                                                                     | 证据                                                                 |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 架构边界约束      | 无任何强制约束，分层靠自觉                                               | 无 `.dependency-cruiser.cjs`，eslint 无边界规则                      |
| 组件文档/设计系统 | 雏形 UI 库（`common/components/ui`）但 0 文档                            | 无 `.storybook/`，package.json 0 个 storybook 依赖                   |
| 主题              | Tailwind v4 `@theme` token 已存在，无暗黑模式                            | `src/styles/globals.css`，无 dark variant                            |
| API 契约          | MSW 全手写 mock，无契约                                                  | 无 `openapi*`/`swagger*` 文件                                        |
| commit 规范       | 无 commitlint/semantic-release                                           | package.json 无相关依赖                                              |
| CSP               | 无                                                                       | `index.html` 无 Content-Security-Policy                              |
| token 存储        | localStorage（XSS 风险面）                                               | `authStore.ts:22`                                                    |
| 依赖审计          | 无                                                                       | `npm audit` 在 npmmirror registry 下报 `NOT_IMPLEMENTED`（真实约束） |
| CLAUDE.md         | 需重读全文核对失真范围（开头 15 行基本准确，gap 文档称后续架构段落失真） | Phase 2 closeout 记录「重写留 Phase 3」                              |
| CI                | 已就绪（Phase 2 S3），可挂接新步骤                                       | `.github/workflows/ci.yml`                                           |
| a11y              | 无审计                                                                   | 无 axe 相关依赖                                                      |

## 1. 全局约定

- 新依赖一律 devDeps（运行时 0 新增，`@sentry/react` Phase 2 已装）。
- 所有治理规则必须「可执行」：规则只写在文档里不算完成，必须接入 lint/CI/commit 卡口。
- 不引入 Monorepo/微前端（gap §4.2 明确「按需」，当前单仓规模不成立）。
- 纯前端 mock 项目无真实后端：涉及后端配合的项（httpOnly cookie、真实发版）只到 **ADR 决策 + 前端预留** 层，并在 plan 内显式声明，避免假完成。
- 沿用既有验证基线：`npm run build` / `lint` / `test` 每 slice 全绿。

================================================================

## S1 架构边界管控（dependency-cruiser）

================================================================

### goal / motivation

分层目前靠自觉，任何 `page` 直接调 `axios`、`lib` 反向依赖 `features` 的越界 import 都不会被拦截。把约定变成 lint 期强制失败。

### success signal

- `npm run cruise` 通过（现有代码 0 违规，或违规已修复/显式豁免）。
- 人为构造一条违规 import 时 `npm run cruise` 退出非 0（验证规则真实生效，验证后移除）。
- CI（S3 的 ci.yml）追加 cruise 步骤。

### non-goals

- 不做循环依赖的全量重构（cruise 可检测循环，但本 slice 只对**跨层方向**立强制规则；循环依赖报告输出但不阻断）。
- 不改任何业务代码的 import 路径（除非恰好命中违规）。

### affected files

- 新增 `.dependency-cruiser.cjs`
- `package.json`（devDep `dependency-cruiser` + script `cruise`）
- `.github/workflows/ci.yml`（追加步骤）

### implementation decisions（规则集，贴合现有分层 page→hooks→api→request）

```js
// .dependency-cruiser.cjs（要点）
module.exports = {
  forbidden: [
    // 1. UI 层（components/pages）不得直接依赖 axios —— 必须经 api/hooks
    {
      name: 'no-axios-in-ui',
      severity: 'error',
      from: { path: 'src/(features/.+/(pages|components)|common)/.*\\.tsx?$' },
      to: { path: 'axios' },
    },
    // 2. lib / api 层不得反向依赖业务层
    {
      name: 'no-reverse-dep',
      severity: 'error',
      from: { path: 'src/(lib|api)/' },
      to: { path: 'src/features/' },
    },
    // 3. common 不得依赖 features（common 是被依赖方）
    {
      name: 'no-common-to-features',
      severity: 'error',
      from: { path: 'src/common/' },
      to: { path: 'src/features/' },
    },
    // 4. 各 feature 之间禁止横向依赖
    {
      name: 'no-cross-feature',
      severity: 'error',
      from: { path: 'src/features/([^/]+)/' },
      to: { path: 'src/features/(?!$1/)[^/]+/' },
    },
  ],
}
```

- 预期存量违规：`request.ts` import 了 `authStore`（`lib → features`，命中规则 2）——Phase 1 为注入 token 引入。处置：该依赖改为**参数注入**（`request` 导出 `setAuthTokenGetter(fn)`，由 `main.tsx` 装配）或对该文件单点豁免并在 ADR 记录。plan 决策：**改为装配注入**（更干净，且改动面小：request.ts 去 import、main.tsx 一行 `setAuthTokenGetter(() => useAuthStore.getState().user?.token)`）。
- `script`: `"cruise": "depcruise src --config .dependency-cruiser.cjs"`

### tests / validation

- `npm run cruise` 退出 0。
- 临时在任意 page 加 `import axios from 'axios'` → cruise 非零退出 → 移除（验证记录写入 impl artifact）。
- `npm run build` 全绿（注入改造不破坏类型）。

### completion signal / stop condition

cruise 全绿 + 规则反例验证通过 + CI 步骤追加。

================================================================

## S2 提交规范（commitlint）

================================================================

### goal / motivation

当前 commit message 无约束（gateflow 产物里既有 `feat(eng):` 也有 `test:`、`chore(eng):`，风格靠自觉）。引入 Conventional Commits 强制校验，为将来自动化发版铺路。

### success signal

- `git commit` 触发 commit-msg hook，不合规范的 message 被拒。
- `npx commitlint --from HEAD~1 --to HEAD` 对最近提交校验通过。

### non-goals

- **不做 semantic-release**：无真实发布场景（无 npm 发布、无正式版本号需求），配置它是无当前需求的过度设计。ADR 中预留「接入条件」，deferred。

### affected files

- 新增 `commitlint.config.cjs`
- 新增 `.husky/commit-msg`（husky 已装）
- `package.json`（devDeps：`@commitlint/cli`、`@commitlint/config-conventional`）

### implementation decisions

```js
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 项目实际使用的 scope 放行
    'scope-enum': [
      2,
      'always',
      ['eng', 'auth', 'product', 'cart', 'order', 'lib', 'ui', 'api', 'mock', 'docs'],
    ],
  },
}
```

`.husky/commit-msg`: `npx --no -- commitlint --edit "$1"`

### tests / validation

- 合规 message commit 成功；`echo "bad message" | npx commitlint` 退出非 0（验证记录）。
- 历史 commit 用 `commitlint --from` 抽查（历史豁免：仅校验新增提交）。

### completion signal

hook 生效 + 反例被拒验证通过。

================================================================

## S3 API 契约（OpenAPI → 类型生成）

================================================================

### goal / motivation

MSW mock 与 `api/index.ts` 的类型各自手写，无单一真源。引入 OpenAPI 契约 → `openapi-typescript` 生成类型，让契约成为前后端解耦的真源。

### success signal

- `docs/api/openapi.yaml` 覆盖现有全部 5 个端点（login/products list/detail/orders list/create order）。
- `npm run gen:api` 生成 `src/api/schema.d.ts`；`api/index.ts` 的响应类型改引生成类型。
- `npm run build` 全绿；MSW handlers 与契约逐端点核对（核对清单写入 impl artifact）。

### non-goals

- 不做 MSW mock 的全自动生成（现有 handler 已正确工作，自动生成收益低、配置成本高）——人工核对契约一致性即可。
- 不引入运行时校验（zod 已在表单层使用，接口层不加，避免过度设计）。

### affected files

- 新增 `docs/api/openapi.yaml`
- 新增 `src/api/schema.d.ts`（生成物，进 git 以便 diff review）
- `src/api/index.ts`（类型改为引用生成类型）
- `package.json`（devDep `openapi-typescript` + script `gen:api`）

### implementation decisions

- 手写 yaml（契约源）；`"gen:api": "openapi-typescript docs/api/openapi.yaml -o src/api/schema.d.ts"`。
- `api/index.ts`：`import type { components } from './schema'`，响应类型映射 `components['schemas']['Product']` 等，保持导出签名不变（调用方零改动）。
- 契约内容以现有 MSW handlers 的真实响应结构为准（handler 是当前事实真源）。

### tests / validation

- `npm run gen:api && npm run build` 全绿。
- 逐端点核对表：handler 响应字段 vs schema 定义（写入 impl artifact）。

### completion signal

类型全部来自生成文件 + 核对表完成。

================================================================

## S4 安全体系（ADR + CSP + 依赖审计）

================================================================

### goal / motivation

token 存 localStorage（XSS 可窃取）、无 CSP、无依赖审计。在纯前端 mock 项目边界内，把「能真做的」做掉，「需后端的」用 ADR 固化决策。

### success signal

- `docs/adr/0001-token-storage.md` 落地（现状风险、目标方案 httpOnly cookie、迁移路径、为何本 phase 不实装）。
- `index.html` 含 CSP meta 且 `npm run build` + dev 启动不受阻断。
- CI 追加 audit 步骤（指定官方 registry 规避 npmmirror 限制），初始 `continue-on-error: true` 仅出报告。

### non-goals

- 不实装 httpOnly cookie（需后端 Set-Cookie，纯 mock 前端做不到——ADR 记录）。
- audit 初始不阻断 CI（存量依赖问题未知，先观测；转阻断留后续决策）。

### affected files

- 新增 `docs/adr/0001-token-storage.md`、`docs/adr/README.md`（ADR 目录说明与模板）
- `index.html`（CSP meta）
- `.github/workflows/ci.yml`（audit 步骤）

### implementation decisions

- CSP 初始策略（贴合 Vite 产物实际需求，宽松起步）：`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:`
  - 注：dev 模式含 HMR websocket，若 meta CSP 阻断 dev（`connect-src`），在 meta 中补 `connect-src 'self' ws:` 并记录；若仍有冲突，降级方案为 CSP 移出 meta、仅在部署层配置（impl 时验证并记录）。
- audit 步骤：`npm audit --omit=dev --registry=https://registry.npmjs.org`，`continue-on-error: true`。
- ADR-0001 按标准 ADR 格式：Context / Decision / Consequences / Migration path。

### tests / validation

- `npm run build` 全绿；dev 启动手动冒烟（HMR 正常）。
- CI yaml 语法校验（ruby yaml parse，与 Phase 2 同法）。

### completion signal

ADR 落地 + CSP 无阻断 + CI audit 步骤就位。

================================================================

## S5 设计系统（Storybook + 暗黑模式 + a11y）

================================================================

### goal / motivation

UI 组件库有雏形但 0 文档；无暗黑模式；无 a11y 审计。

### success signal

- `npm run storybook` 可启动并展示 `common/components/ui` 核心组件 stories。
- 暗黑模式：主题 toggle 组件落地，切换后全站 token 生效并持久化（localStorage）。
- a11y：至少对 `Modal`、`Button` 完成 axe 审计（0 critical 违规或修复/豁免记录）。

### non-goals

- 不做视觉回归快照（需 CI 快照基础设施，当前收益低）。
- 不为全部组件补 stories（首批覆盖 ui 目录核心 5-8 个）。

### affected files

- 新增 `.storybook/main.ts`、`.storybook/preview.ts`、`src/**/*.stories.tsx`（首批）
- `src/styles/globals.css`（Tailwind v4 dark variant 定制）、主题 toggle 组件、`main.tsx` 初始化
- `package.json`（storybook devDeps + scripts + axe deps）

### implementation decisions

- **兼容性前置验证（本 slice 第一件事）**：安装 `@storybook/react-vite` 最新版并启动空 story——若与 Vite 8 / React 19 存在不可绕过的兼容冲突，**整个 Storybook 部分 defer**（记录至 control_doc），暗黑模式与 a11y 独立完成（两者不依赖 Storybook）。这是本 slice 的显式 stop-or-continue 分支。
- 暗黑模式用 Tailwind v4 官方方式：`@custom-variant dark (&:where(.dark, .dark *))` + class 策略 + `useTheme` hook（localStorage 持久化 + 跟随系统初始值）。
- a11y：`@storybook/addon-a11y`（若 SB 可用）+ `axe-core` 独立脚本双路径。

### tests / validation

- SB：启动成功 + 首批 stories 渲染。
- 暗黑：toggle 后 `document.documentElement.classList` 含 `dark`，刷新持久。
- axe：无 critical（或修复/豁免清单）。
- `npm run build` 全绿。

### completion signal

三分支各自达成（或 SB 分支按 plan 显式 defer）。

================================================================

## S6 文档治理（CLAUDE.md 重写 + ADR）

================================================================

### goal / motivation

`CLAUDE.md` 部分失真且未覆盖 Phase 1-3 新增的全部工程能力；ADR 机制建立后可持续记录决策。

### success signal

- `CLAUDE.md` 重写：真实技术栈、真实命令、真实架构图景（含 Phase 1-3 全部能力）、当前约束（mock-only、token 方案 ADR 指向）。
- `docs/adr/` 至少 3 篇：0001 token 存储（S4 已建）、0002 状态管理分层（react-query vs zustand 边界）、0003 构建分包与体积预算策略。

### non-goals

- 不写 README 以外的营销性文档；不做 CHANGELOG（无 semantic-release，见 S2）。

### affected files

- `CLAUDE.md`（重写）
- `docs/adr/0002-state-management.md`、`docs/adr/0003-build-chunking.md`
- `docs/adr/README.md`（S4 已建，补充索引）

### implementation decisions

- CLAUDE.md 结构：项目定位 → 常用命令 → 架构分层（含依赖方向规则，引用 S1 的 cruise）→ 测试 → 构建与体积预算 → CI → 可观测 → 权限 → 安全决策（指向 ADR）→ 约束与已知限制。
- 内容必须与代码逐一核对（Phase 2 aggregate review 的教训：文档失真的根源是「没跟着代码走」）。

### tests / validation

- 文档中每条命令实际可执行；每个架构描述与目录一致（自查清单写入 impl artifact）。

### completion signal

文档失真清零 + ADR 3 篇落地。

================================================================

## Slice 执行顺序与依赖

```text
S1 架构边界（cruise） → S2 提交规范（commitlint） → S3 API 契约（OpenAPI）
→ S4 安全（ADR+CSP+audit） → S5 设计系统（SB+暗黑+a11y，含兼容性分支） → S6 文档治理（收口）
```

- S6 必须最后：文档反映全部最终架构。
- S5 风险最高（Storybook×Vite 8 兼容）放最后，且内置 stop-or-continue 分支，不阻塞前序。

## docs decision

- ADR 机制本 phase 建立（S4 首建目录，S6 补齐）。
- `CLAUDE.md` 重写收口（S6）。
- control_doc 每 slice 后同步更新（同 Phase 2 惯例）。

## 全局 risks / open questions（residual risk 分类）

| 风险/开放问题                            | 分类                        | 去向                                |
| ---------------------------------------- | --------------------------- | ----------------------------------- |
| Storybook × Vite 8 / React 19 兼容性未知 | covered-by-later-slice      | S5 内置分支：不兼容则 defer SB 部分 |
| `npm audit` registry 限制                | fixed-in-current-slice      | S4 用官方 registry 指定             |
| httpOnly cookie 无法实装（无后端）       | assigned-to-later-work-unit | ADR-0001 固化，后端联调期实施       |
| semantic-release 无发布场景              | deferred-with-owner         | ADR/文档记录接入条件                |
| CSP 可能影响 dev HMR                     | needs-more-evidence         | S4 impl 时验证，降级方案已备        |
| 存量依赖漏洞未知                         | needs-more-evidence         | S4 audit 报告产出后再决策是否转阻断 |

## completion report format

每 slice 完成后报告：slice id、改动文件清单、validation 结果（命令+输出摘要）、residual risk 状态、commit hash。

## 为何未过度设计

- 全部 6 项均直接对应 gap 文档 P2 行与 §4 章节，无自行扩展项。
- 每项取「最小可治理」实现：cruise 只管跨层方向、commitlint 不带 semantic-release、OpenAPI 只生成类型不做 mock 全自动、CSP 宽松起步、SB 首批 5-8 组件、ADR 只记真实决策。
- 无真实后端/发布场景的项显式降级为 ADR/deferred，不假装完成。

================================================================

## Plan Review 修订增补（对应 docs/reviews/plan-review-20260909-170455.md F1-F6）

================================================================

以下决策为 plan review accepted findings 的修订增补，与上文同效力：

### 修订 1（F1）— S1 存量违规完整清单与 hydrateAuth 处置

- 存量 lib→features 违规共 **2 处**：`src/lib/request.ts`（import authStore 取 token）与 `src/lib/hydrateAuth.ts`（整文件就是对 authStore 的薄封装）。
- `request.ts`：改为 `setAuthTokenGetter(fn)` 装配注入，`main.tsx` 装配。
- `hydrateAuth.ts`：**整体迁移至 `src/features/auth/lib/hydrateAuth.ts`**（auth 状态的 hydrate 逻辑归属 auth feature），`router.tsx:5` 改 import 路径。该文件无其他消费方（已核实仅 router 引用）。
- 验证点：cruise 对 lib→features 规则全绿。

### 修订 2（F2）— S5 暗黑模式成功信号收窄（三层递进）

- (a) token 层：`@theme` 补语义灰阶变量（surface/text/border 等），`.dark` 下整体覆盖。
- (b) 交互层：`useTheme` hook + toggle 组件 + localStorage 持久化 + 首次跟随系统。
- (c) 适配层：首批 3-5 个核心组件/页面改用语义 token（App 布局、ProductListPage、Header）并验证视觉。
- **全站组件适配显式 defer**（现有硬编码灰阶的组件逐个改造属独立工作量），记录于 control_doc residual risks。success signal 的「全站生效」按此理解。

### 修订 3（F3）— S4 CSP 决策前置为 prod-only

- **不**在 index.html 静态放 CSP meta（Vite dev 注入 inline script + HMR ws，必被 `script-src 'self'` 拦截）。
- 改为：自写 ~10 行 Vite 插件（`transformIndexHtml` 钩子 + `apply: 'build'`），仅在构建产物注入 CSP meta；dev 完全不受影响。
- 验证点：build 产物 html 含 CSP meta；dev 启动正常。

### 修订 4（F4）— S3 双真源处置：src/types 改为 schema re-export

- `src/types/index.ts` 全部类型改为从生成 schema re-export：`export type Product = components['schemas']['Product']`。
- 8 个消费方（handlers/3 hooks/2 pages/request/api）**零改动**，单一真源落在 `docs/api/openapi.yaml`。
- yaml 中 schema 命名必须与现有类型名对齐：`Product`、`ProductListResponse`、`Order`、`OrderListResponse`、`CheckoutRequest`、`CheckoutResponse`、`ApiResponse`、`ApiError`（命名核对表写入 impl artifact）。

### 修订 5（F5）— S1 首步验证 $1 反向引用语法

- S1 实现第一步：先单独验证规则 4 的 `from` 捕获组在 `to` 中 `$1` 反向引用（构造跨 feature 反例）。
- 若 cruiser 不支持：降级为显式枚举 features 目录（auth/product/cart/order，当前仅 4 个，成本可控），验证记录写入 impl artifact。

### 修订 6（F6）— S2 husky 9 hook 格式

- `.husky/commit-msg` 文件格式照抄现有 `.husky/pre-commit`（husky 9：无 shebang，直接命令行）。
