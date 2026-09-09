# ADR-0001：token 存储方案

状态：accepted（前端侧预留；后端联调期实施目标方案）

## Context

- 现状：登录 token 存 `localStorage`（`authStore`），随每次请求经 Authorization 头发送。
- 风险：localStorage 可被同源任意 JS 读取——一旦存在 XSS（第三方脚本、被污染的依赖），token 即可被窃取。
- 约束：当前为纯前端 + MSW mock 项目，无真实后端，无法在 client 侧单方面实现 httpOnly cookie。

## Decision

- **目标方案（后端联调期实施）**：后端登录成功后以 `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict` 下发；前端 axios 开启 `withCredentials`，删除 localStorage 读写与手动 Authorization 注入。
- **前端侧当前阶段的缓解（本 ADR 落地部分）**：
  1. token 仅经 `request.ts` 集中管理（token getter 注入），不散落业务代码；
  2. token 不进 URL、不进日志；
  3. 引入 CSP（生产构建注入），收窄 XSS 攻击面（见 vite.config 的 csp-inject 插件）；
  4. 依赖审计进入 CI（供应链风险观测）。

## Consequences

- 正面：XSS 面收窄；token 管理路径单一；迁移路径清晰。
- 负面：localStorage 方案短期仍存 XSS 窃取风险（缓解而非消除）；httpOnly 方案依赖后端配合，跨端（小程序等）需另行设计。

## Migration path

1. 后端实现 Set-Cookie（HttpOnly/Secure/SameSite）与 CSRF 防护；
2. 前端 `request.ts` 开启 withCredentials、移除 setAuthTokenGetter 装配；
3. `authStore` 移除 token 字段持久化（仅存用户信息）；
4. 更新本 ADR 状态为 superseded（由实施 ADR 取代）。
