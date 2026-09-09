# ADR-0003：构建分包与体积预算策略

状态：accepted

## Context

Vite 默认单包输出，第三方依赖与业务代码混在一起，任何小改动都会使全量 hash 变化，缓存失效、体积膨胀不可见。

## Decision

- 分包：`manualChunks` 函数式按「生态」分组——react（react/react-dom/scheduler/jsx-runtime）、react-query、router（react-router/@remix-run）、state（zustand）、monitoring（@sentry）、其余 node_modules 入 vendor。函数式而非对象映射，避免遗漏传递依赖（对象映射不追踪依赖内部引用）。
- 压缩：gzip（vite-plugin-compression）；brotli 因插件多实例在 Vite 8 下未产出而暂缓。
- 预算：size-limit 200 kB（brotli 压缩后，实测约 156 kB），CI 内 `npm run size` 阻断。
- 分析：`ANALYZE=1 npm run build` 按需生成 stats.html（visualizer 常驻会使构建 1.5s→19s，故按需启用）。

## Consequences

- 正面：vendor 与业务分离、长效缓存稳定；体积回归有门禁；按需分析无构建税。
- 负面：新增重要依赖需手动评估归组（默认入 vendor）；brotli 缺席压缩率略低。
