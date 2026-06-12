import { Outlet } from 'react-router-dom'
import Header from '@/common/components/Header'
import { ErrorBoundary } from '@/common/components/ErrorBoundary'
import { ToastProvider } from '@/common/components/ToastProvider'

function App() {
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
