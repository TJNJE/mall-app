import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { RouterProvider } from './lib/router'
import { initMonitor } from './lib/monitor'

// 尽早初始化监控（Web Vitals 需在首屏渲染前注册）
initMonitor()

// 开发环境开启 Mock
if (import.meta.env.DEV) {
  const { worker } = await import('./mock/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider />
  </StrictMode>,
)
