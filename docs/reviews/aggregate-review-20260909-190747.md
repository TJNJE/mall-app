# Aggregate Deep Review — Phase 3 (P2) 治理能力补齐

## Scope

- Mode: current changes（aggregate）
- Branch: feat/eng-gaps-implement；Base: e370c84（Phase 3 plan commit）
- 覆盖 commits: 50f08fb(S1) → c2f3580(S2) → ed0f007(S3) → 68ab713(S4) → 36da952(S5) → 81679a3(S6)
- 范围统计: 36 files changed, +5782 / -597（大头为 schema.d.ts 生成物与 package-lock）
- 各 slice 独立 review 已完成（S1-S6 artifact 见 docs/reviews/），本审查聚焦跨 slice 耦合与整体一致性。

## 跨 Slice 耦合点走读（全部验证通过）

| 耦合点                                         | 涉及 slice | 结论                                                                                 |
| ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| request.ts 双改造共存（token 注入 + 解包契约） | S1×Phase1  | 单断言修复后 lint 通过；不再反向依赖 authStore，cruise 全绿                          |
| types/index.ts re-export 与 8 个消费方         | S3         | 消费方零改动编译通过；无双真源（旧子文件已无引用）                                   |
| commitlint hook 对后续提交的强制               | S2×S2-S6   | hook 生效被实测：2 次 commit 因 subject-case/body 长度被拒，修正后通过——规则真实生效 |
| cruise 规则与最终代码状态                      | S1×S3-S6   | 新增 ThemeToggle/hooks 等文件均未触发违规（1168 modules 0 violations）               |
| CSP 与生产产物                                 | S4×S2      | dist/index.html 含 CSP meta；分包/压缩产物正常                                       |
| SB 10.6 × Vite 8 兼容                          | S5         | storybook build EXIT=0（plan 分支判定 continue）                                     |
| CLAUDE.md 与代码一致性                         | S6×全部    | 文档逐节对应真实文件/命令/规则；已知限制如实记录                                     |

## Findings

### F1-未修复-低-gen:api 未接入 CI

- 位置：.github/workflows/ci.yml
- 场景：yaml 与 schema.d.ts 漂移（改 yaml 忘跑 gen）不会被 CI 拦截
- 直接证据：CI 步骤无 gen:api 或 diff 校验
- 建议：CI 加 `npm run gen:api && git diff --exit-code src/api/schema.d.ts`
- 修复风险：低；严重程度：低；裁决：deferred-with-owner（下批治理）

### F2-未修复-低-待清理文件两组

- 位置：src/common/**cruise_canary**.ts（空）与 src/types/{api,product,order}.ts（死文件）
- 场景：仓库整洁度；删除命令触发权限审批超时（多次），agent 无法完成
- 直接证据：S1/S3 各自 review artifact 记录
- 建议：用户执行 `rm src/common/__cruise_canary__.ts src/types/api.ts src/types/product.ts src/types/order.ts`
- 修复风险：低；严重程度：低；裁决：deferred-with-owner（owner：用户）

### F3-未修复-低-新增治理能力无自动化测试

- 位置：cruise 规则、gen:api、暗黑切换均无测试
- 场景：规则被误改/生成器升级破坏类型时无回归保护
- 直接证据：测试仍为 Phase 1 的 6 用例
- 影响：与 Phase 2 相同的最大 residual，延续
- 建议：后续批次补（cruise 规则反例测试、schema 快照、useTheme 测试）
- 修复风险：低；严重程度：低；裁决：deferred-with-owner

## Deferred 汇总（Phase 3）

| 项                             | 来源        | 去向             |
| ------------------------------ | ----------- | ---------------- |
| semantic-release               | S2          | 有真实发布场景后 |
| httpOnly cookie                | S4 ADR-0001 | 后端联调期       |
| Sentry SourceMap + connect-src | S4          | 真实凭据后       |
| audit 转阻断                   | S4          | CI 首跑数据后    |
| focus-trap + a11y 深化         | S5          | a11y 批次        |
| 暗黑全站适配                   | S5          | 后续批次         |
| gen:api 入 CI                  | S3          | 下批治理         |
| 手动删除遗留文件               | S1/S3       | 用户             |

## Conclusion

**pass-with-risks**。六个 slice 的跨 slice 耦合点全部走读验证；commitlint 的强制力、cruise 的零违规、CSP 的产物注入、SB 的兼容性均有直接证据；3 个 findings 均为低 severity 并已裁决 deferred-with-owner。Phase 3 可收尾。
