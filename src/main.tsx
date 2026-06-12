import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from './lib/router'

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
