import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import CartIcon from '@/features/cart/components/CartIcon'
import { ThemeToggle } from '@/common/components/ui/ThemeToggle'

export default function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleClickLogout = () => {
    logout()
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-5 flex items-center h-[60px]">
        <Link to="/" className="text-lg font-bold text-primary no-underline mr-10">
          商城
        </Link>
        <nav className="flex gap-6">
          <Link
            to="/"
            className={`no-underline text-sm py-2 ${location.pathname === '/' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}
          >
            首页
          </Link>
          <CartIcon />
          {isAuthenticated && (
            <Link
              to="/orders"
              className={`no-underline text-sm py-2 ${location.pathname.startsWith('/order') ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}
            >
              我的订单
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {user?.username}{' '}
              <button
                type="button"
                onClick={handleClickLogout}
                className="border-0 bg-transparent text-red-500 cursor-pointer text-xs px-2 py-1"
              >
                退出
              </button>
            </span>
          ) : (
            <Link to="/login" className="no-underline text-primary text-sm font-medium">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
