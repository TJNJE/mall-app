# ADR-0002：状态管理分层（react-query vs zustand）

状态：accepted

## Context

应用同时存在服务端数据（商品、订单——来自 API、可缓存、会过期）与客户端状态（购物车、登录态、主题——纯本地）。若不加区分地放进同一状态方案，会导致缓存失效逻辑与本地状态互相纠缠。

## Decision

- **服务端状态一律 @tanstack/react-query**：自定义 hook 封装（useProductList/useProductDetail/useCreateOrder），缓存键集中在 hook 内导出（如 productDetailQueryKey），staleTime 按数据变更频率设置。
- **客户端状态一律 zustand**：authStore（含 localStorage 持久化）、cartStore（含 localStorage 持久化）。
- 分层依赖方向（dependency-cruiser 强制，见 .dependency-cruiser.cjs）：pages/components → hooks（query）或 stores（client）→ api → request；禁止反向与跨 feature。

## Consequences

- 正面：缓存、重试、失效语义交给 react-query；本地状态轻量可持久化；职责边界可被工具强制。
- 负面：两套状态 API 并存，新人需理解「数据从哪来」的判断规则（是否来自服务端）。
