import { Outlet } from 'react-router-dom'
import Header from '@/common/components/Header'

function App() {
  return (
    <div>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default App
