import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// S4 安全：仅生产构建注入 CSP meta。
// 不放 index.html 静态原因：Vite dev 注入 inline script + HMR ws，会被 script-src 'self' 拦截。
// 若后续接入 Sentry，需在 connect-src 追加其上报域名（见 ADR-0001 缓解措施 3）。
const cspInjectPlugin = () => ({
  name: 'csp-inject',
  apply: 'build' as const,
  transformIndexHtml(html: string): string {
    const csp = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join('; ')
    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
    )
  },
})

// https://vite.dev/config/
export default defineConfig({
  // React Compiler 在 @vitejs/plugin-react v6 需通过 reactCompilerPreset() 配合
  // @rolldown/plugin-babel 启用（该 peer 未安装），当前 deferred，见 control_doc
  plugins: [
    cspInjectPlugin(),
    react(),
    tailwindcss(),
    viteCompression(), // gzip
    // brotli：vite-plugin-compression 第二个实例在 Vite 8 / rolldown 下未产出 .br，
    // 暂不启用（保留 gzip），见 S2 code review
    // 包体积分析按需启用：ANALYZE=1 npm run build
    // （常驻会使 build 从 ~1.5s 增至 ~19.6s，见 S2 code review F2）
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  build: {
    rollupOptions: {
      output: {
        // 函数式分包：避免对象映射遗漏传递依赖（plan review F3 建议）
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return null
          if (id.includes('@tanstack/react-query')) return 'react-query'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'router'
          if (id.includes('zustand')) return 'state'
          // @sentry/react 会命中下面的 '/react/' 规则，需前置单独分组
          if (id.includes('@sentry')) return 'monitoring'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler'))
            return 'react'
          return 'vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/mock/**', 'src/**/*.d.ts'],
    },
  },
})
