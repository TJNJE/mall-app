# Gateflow Control Doc — mall-app 工程化能力补齐

- **work unit 类型**：architecture-sensitive / multi-phase engineering
- **design_doc**：`FRONTEND_ENGINEERING_GAPS.md`（目标与优先级真源）
- **mode**：Mode B（多 phase 总控，逐 phase gate 控制）
- **base branch**：`master`
- **work branch**：`feat/eng-gaps-implement`

## 总目标

依据 `FRONTEND_ENGINEERING_GAPS.md`，按 **P0 → P1 → P2** 逐步补齐缺失的前端工程化能力。
每个 phase 作为一个独立 work unit，走完整 Gate Order，逐 gate 控制、可验证、可追溯。

## Phase 计划

### Phase 1 (P0) — 质量底线 [completed]

- **goal**：落地三项质量底线能力
  1. 测试体系：`vitest` + `React Testing Library`，覆盖 `cartStore` / `useProductList`
  2. 类型严格化：`tsconfig` 开 `strict`、`api/index.ts` 去除 `as unknown as`、ESLint 升 `type-checked`
  3. 规范自动化：引入 Prettier + `husky` + `lint-staged`
- **success signal**：
  - `npm run test` 通过且有覆盖率报告
  - `tsc --noEmit` 在 `strict` 下零报错
  - `git commit` 自动触发 lint + format（husky + lint-staged）
- **scope boundary**：仅 P0 三项；不碰构建/CI/可观测/权限
- **status**：completed — C/A/B 已提交（6f142e7 / 9cef952 / 1833c2f）

### Phase 2 (P1) — 可交付 [current]

- 性能（memo / 预取 / React Compiler）、构建分包与压缩、CI/CD 流水线、可观测（Sentry / Performance / 埋点）、权限（RBAC + 404 + 路由级 ErrorBoundary）
- plan: `docs/gateflow/eng-gaps-phase2-plan.md`
- plan review: `docs/reviews/plan-review-20260909-104547.md`（conclusion: pass-with-risks）

### Phase 2 Slice 跟踪（逐 slice gate，commit 见本表）

| Slice | 内容                              | 状态                                 | commit  |
| ----- | --------------------------------- | ------------------------------------ | ------- |
| S1    | 性能（memo/预取/React Compiler）  | committed（React Compiler deferred） | 375fd9a |
| S2    | 构建分包与压缩                    | committed（brotli deferred）         | bd7e21c |
| S3    | CI/CD 流水线                      | committed                            | —       |
| S4    | 可观测（Sentry/Performance/埋点） | pending                              | —       |
| S5    | 权限（RBAC/404/ErrorBoundary）    | pending                              | —       |

> S1 code review: `docs/reviews/code-review-20260909-143211.md`
> F1 React Compiler deferred（`@vitejs/plugin-react` v6 的 `Options` 不含 `reactCompiler` / `babel`，需 `reactCompilerPreset()` + `@rolldown/plugin-babel`）；F2 预取防抖 / F3 测试覆盖 / F4 `request.ts` 断言均为 deferred-with-owner，不阻塞 accept。
>
> S2 code review: `docs/reviews/code-review-20260909-145408.md`
> F1 brotli 未产出任何 `.br`（deferred，当前仅 gzip）；F2 visualizer 改为 `ANALYZE=1` 按需启用（已 fix）；F3 体积预算由 500 kB 收紧至 200 kB（已 fix）。
>
> S3 code review: `docs/reviews/code-review-20260909-150042.md`
> F1 加 `permissions: contents: read`（已 fix）；F2 加 `concurrency` 取消过期运行（已 fix）。CI 远端实际运行结果待 PR 触发确认。

### Phase 3 (P2) — 可治理 [pending]

- 架构边界管控（dependency-cruiser）、设计系统（Storybook / 暗黑模式）、API 契约、安全体系、文档治理（CLAUDE.md / ADR）

## 当前状态

- **current phase**：Phase 2 (P1)
- **current gate**：plan review (pass-with-risks)
- **next entry point**：implementation — Slice S1 性能优化（建议顺序 S1→S2→S3→S5→S4）

### Phase 1 Slice 跟踪（逐 slice gate，commit 见本表）

| Slice | 内容                                     | 状态      | commit  |
| ----- | ---------------------------------------- | --------- | ------- |
| C     | 规范自动化（Prettier+Husky+lint-staged） | committed | 6f142e7 |
| A     | 测试体系（vitest+RTL+MSW）               | committed | 9cef952 |
| B     | 类型严格化（strict+type-checked）        | committed | 1833c2f |

## 不做的过度设计

- 不引入 Monorepo / 微前端（无真实规模压力）
- 不重写现有功能架构
- P0 阶段不提前做 P1/P2 内容

## Residual Risks

（随 gate 推进持续更新）

| 项                     | 分类                    | owner / destination |
| ---------------------- | ----------------------- | ------------------- |
| P1/P2 尚未实现         | assigned to later phase | Phase 2 / Phase 3   |
| 测试范围仅 P0 两处示例 | covered by later slice  | Phase 1 后续 slice  |
