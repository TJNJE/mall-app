import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import { RouterProvider } from './lib/router'
import { initMonitor } from './lib/monitor'
import { setAuthTokenGetter } from './lib/request'
import { useAuthStore } from './features/auth/stores/authStore'

// 尽早初始化监控（Web Vitals 需在首屏渲染前注册）
initMonitor()

// token 获取器装配：request 层经注入获取 token，不反向依赖 auth feature（S1 cruise）
setAuthTokenGetter(() => useAuthStore.getState().user?.token)

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
