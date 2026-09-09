import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '@/common/components/Header'
import { ErrorBoundary } from '@/common/components/ErrorBoundary'
import { ToastProvider } from '@/common/components/ToastProvider'
import { track } from '@/lib/track'

function App() {
  const { pathname } = useLocation()

  // 路由变化自动上报 PV（S4 可观测）
  useEffect(() => {
    track('page_view', { path: pathname })
  }, [pathname])

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
