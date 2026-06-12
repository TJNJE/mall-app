import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'

export default function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuthStore()

  const handleClickLogout = () => {
    logout()
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          商城
        </Link>
        <nav style={styles.nav}>
          <Link
            to="/"
            style={{
              ...styles.link,
              color: location.pathname === '/' ? '#1677ff' : '#333',
            }}
          >
            首页
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              style={{
                ...styles.link,
                color: location.pathname.startsWith('/order') ? '#1677ff' : '#333',
              }}
            >
              我的订单
            </Link>
          )}
        </nav>
        <div style={styles.right}>
          {isAuthenticated ? (
            <span style={styles.user}>
              {user?.username}{' '}
              <button style={styles.logoutBtn} type="button" onClick={handleClickLogout}>
                退出
              </button>
            </span>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: 60,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1677ff',
    textDecoration: 'none',
    marginRight: 40,
  },
  nav: {
    display: 'flex',
    gap: 24,
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontSize: 14,
    padding: '8px 0',
  },
  right: {
    marginLeft: 'auto',
  },
  user: {
    fontSize: 14,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    border: 'none',
    background: 'none',
    color: '#ff4d4f',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px 8px',
  },
  loginBtn: {
    textDecoration: 'none',
    color: '#1677ff',
    fontSize: 14,
    fontWeight: 500,
  },
}
