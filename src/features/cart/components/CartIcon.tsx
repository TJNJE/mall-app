import { Link } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'

export default function CartIcon() {
  const { count } = useCartStore((s) => s.getTotal())

  if (count === 0) return null

  return (
    <Link to="/cart" style={styles.link}>
      购物车
      <span style={styles.badge}>{count}</span>
    </Link>
  )
}

const styles: Record<string, React.CSSProperties> = {
  link: {
    position: 'relative',
    textDecoration: 'none',
    color: '#333',
    fontSize: 14,
    padding: '8px 0',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -16,
    background: '#e74c3c',
    color: '#fff',
    fontSize: 11,
    minWidth: 16,
    height: 16,
    lineHeight: '16px',
    borderRadius: 8,
    textAlign: 'center',
    padding: '0 4px',
  },
}
