import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem } = useCartStore()
  const count = useCartStore((s) => s.getCount())
  const amount = useCartStore((s) => s.getAmount())

  if (items.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>购物车</h1>
        <div style={styles.empty}>
          <p>购物车是空的</p>
          <button style={styles.btn} type="button" onClick={() => navigate('/')}>
            去逛逛
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>购物车</h1>

      <div style={styles.list}>
        {items.map((item) => (
          <div key={item.productId} style={styles.item}>
            <img src={item.productImage} alt={item.productName} style={styles.image} />
            <div style={styles.info}>
              <h3 style={styles.name}>{item.productName}</h3>
              <span style={styles.price}>¥{item.price}</span>
            </div>
            <div style={styles.qty}>
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
            <span style={styles.subtotal}>¥{(item.price * item.quantity).toFixed(2)}</span>
            <button type="button" style={styles.delete} onClick={() => removeItem(item.productId)}>
              删除
            </button>
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <span>共 {count} 件</span>
        <span style={styles.total}>合计：¥{amount.toFixed(2)}</span>
        <button style={styles.checkoutBtn} type="button" onClick={() => navigate('/checkout')}>
          去结算
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto' },
  heading: { fontSize: 22, fontWeight: 600, color: '#333', marginBottom: 20 },
  empty: { textAlign: 'center', padding: 60, color: '#999' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #f0f0f0',
  },
  image: { width: 80, height: 80, objectFit: 'cover', borderRadius: 6 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: 500, color: '#333', margin: 0 },
  price: { fontSize: 14, color: '#e74c3c', fontWeight: 600 },
  qty: { display: 'flex', alignItems: 'center', gap: 8 },
  subtotal: { fontSize: 14, color: '#333', fontWeight: 600, minWidth: 70, textAlign: 'right' },
  delete: {
    border: 'none',
    background: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: 13,
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 20,
    paddingBottom: 20,
  },
  total: { fontSize: 18, fontWeight: 700, color: '#e74c3c' },
  checkoutBtn: {
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 600,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
