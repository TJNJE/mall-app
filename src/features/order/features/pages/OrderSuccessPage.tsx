import { useSearchParams, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId') || ''

  return (
    <div style={styles.container}>
      <div style={styles.successIcon}>✓</div>
      <h1 style={styles.title}>下单成功！</h1>
      <p style={styles.orderId}>订单号：{orderId}</p>
      <div style={styles.actions}>
        <button style={styles.viewOrdersBtn} onClick={() => navigate('/orders')}>
          查看订单
        </button>
        <button style={styles.continueBtn} onClick={() => navigate('/')}>
          继续购物
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: '#52c41a',
    color: '#fff',
    fontSize: 40,
    lineHeight: '80px',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: '#333',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  actions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  },
  viewOrdersBtn: {
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 500,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  continueBtn: {
    padding: '12px 32px',
    fontSize: 15,
    background: '#fff',
    color: '#333',
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
