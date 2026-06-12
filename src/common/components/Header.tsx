import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/orders', label: '我的订单' },
  ]

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          商城
        </Link>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                color: location.pathname === item.path ? '#1677ff' : '#333',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
}
