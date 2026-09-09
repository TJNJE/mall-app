# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供本仓库的开发指导。

## 项目

**mall-app** — 基于 React 19 + TypeScript 的商城单页应用，用于向有 Vue 基础的开发人员教授 React。所有数据通过 MSW 模拟。

## 常用命令

```bash
npm run dev        # 启动 Vite 开发服务器（含 HMR + MSW Mock）
npm run build      # TypeScript 类型检查 (tsc -b) 后构建到 dist/
npm run lint       # 运行 ESLint
npm run preview    # 本地预览生产构建
```

## 架构

### 技术栈

- **React 19** + TypeScript 6 + Vite 8
- **react-router-dom v7** — 基于布局路由的路由方案
- **@tanstack/react-query v5** — 所有数据请求（useQuery 读操作，useMutation 写操作）
- **axios** — HTTP 客户端，带拦截器（当 `code === 0` 时自动提取 `data` 字段）
- **msw v2** — Service Worker 拦截 API 请求（仅开发环境）

### 目录结构

```
src/
├── main.tsx                          # 入口：启动 MSW worker + 挂载 App
├── App.tsx                           # 根布局：<Header> + <Outlet>
├── lib/
│   ├── router.tsx                    # BrowserRouter + 所有路由定义
│   ├── query.tsx                     # QueryClient 单例（全局 staleTime: 5 分钟）
│   └── request.ts                    # Axios 实例，含请求/响应拦截器
├── api/
│   └── index.ts                      # 类型化 API 函数（getProductList、createOrder 等）
├── types/
│   ├── api.ts                        # ApiResponse、ApiError、PaginationParams
│   ├── product.ts                    # Product、ProductListResponse
│   └── order.ts                      # Order、OrderItem、CheckoutRequest、CheckoutResponse
├── common/components/
│   └── Header.tsx                    # 顶部导航栏（Logo + 链接）
├── features/
│   ├── product/features/
│   │   ├── hooks/                    # useProductList、useProductDetail
│   │   └── pages/                    # ProductListPage、ProductDetailPage
│   └── order/features/
│       ├── hooks/                    # useCreateOrder
│       └── pages/                    # CheckoutPage、OrderSuccessPage、OrderListPage、OrderDetailPage
└── mock/
    ├── browser.ts                    # MSW setupWorker + 路由处理
    ├── handlers.ts                   # Mock CRUD 逻辑（订单数据持久化到 localStorage）
    └── products.ts                   # 静态商品数据（6 个商品）
```

### 数据流

```
页面组件 → 自定义 Hook（useQuery/useMutation） → API 函数 → Axios 拦截器 → MSW Mock → 静态数据
```

每个功能模块拥有自己的 hooks 和 pages。Hooks 封装 TanStack Query 调用并传入类型化的 queryKey。Pages 只做纯 UI 组合，不直接调用 API。

### 关键模式

- **布局路由**：`App.tsx` 使用 `<Outlet />` 包裹所有页面，共享 `<Header>`
- **Query 缓存**：全局 `staleTime: 5 分钟`；单个查询可覆盖（如订单使用 `staleTime: 0` 确保每次进入都获取最新数据）
- **Mock 持久化**：订单数据存储在 `localStorage`（key `__mall_orders__`），模拟 HMR 热更新后数据不丢失
- **内联样式**：所有组件使用 `React.CSSProperties` 对象 — 无 CSS Modules 或 Tailwind
- **路径别名**：`@/*` → `src/*`

### 路由

| 路由             | 组件              |
| ---------------- | ----------------- |
| `/`              | ProductListPage   |
| `/product/:id`   | ProductDetailPage |
| `/checkout`      | CheckoutPage      |
| `/order/success` | OrderSuccessPage  |
| `/orders`        | OrderListPage     |
| `/order/:id`     | OrderDetailPage   |
