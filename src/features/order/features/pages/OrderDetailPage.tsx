import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/api'
import type { Order } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: '#faad14' },
  paid: { label: '已付款', color: '#1677ff' },
  shipped: { label: '已发货', color: '#722ed1' },
  completed: { label: '已完成', color: '#52c41a' },
  cancelled: { label: '已取消', color: '#999' },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderDetail(id || '') as unknown as Promise<Order>,
    enabled: !!id,
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>加载中...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={styles.error}>
        <p>订单不存在</p>
        <button style={styles.backBtn} onClick={() => navigate('/orders')}>
          返回订单列表
        </button>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/orders')}>
        ← 返回
      </button>

      <h1 style={styles.heading}>订单详情</h1>

      {/* 订单状态 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>订单状态</h2>
        <div style={styles.statusBadge}>
          <span style={{ ...styles.statusDot, background: statusInfo.color }} />
          <span style={styles.statusText}>{statusInfo.label}</span>
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>订单号</span>
            <span style={styles.infoValue}>{order.id}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>创建时间</span>
            <span style={styles.infoValue}>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 收货信息 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>收货信息</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>收货人</span>
            <span style={styles.infoValue}>{order.address.name}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>联系电话</span>
            <span style={styles.infoValue}>{order.address.phone}</span>
          </div>
          <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
            <span style={styles.infoLabel}>详细地址</span>
            <span style={styles.infoValue}>
              {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
            </span>
          </div>
        </div>
      </div>

      {/* 商品信息 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>商品信息</h2>
        {order.items.map((item, i) => (
          <div key={i} style={styles.cartItem}>
            <img src={item.productImage} alt={item.productName} style={styles.itemImage} />
            <div style={styles.itemInfo}>
              <h3 style={styles.itemName}>{item.productName}</h3>
              <span style={styles.itemPrice}>¥{item.price}</span>
              <span style={{ ...styles.itemPrice, fontSize: 13, color: '#999' }}>{`x${item.quantity}`}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 金额汇总 */}
      <div style={styles.totalBox}>
        <div style={styles.totalRow}>
          <span>商品总金额</span>
          <span style={styles.totalValue}>¥{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
  },
  backBtn: {
    border: '1px solid #d9d9d9',
    background: '#fff',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: '#333',
    marginBottom: 20,
  },
  section: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #f0f0f0',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#333',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #f0f0f0',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  statusText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#333',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
  },
  infoLabel: {
    color: '#999',
  },
  infoValue: {
    color: '#333',
  },
  cartItem: {
    display: 'flex',
    gap: 12,
    padding: 12,
    background: '#fafafa',
    borderRadius: 6,
    marginBottom: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 600,
  },
  totalBox: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #f0f0f0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 16,
    fontWeight: 600,
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    color: '#e74c3c',
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #f3f3f3',
    borderTopColor: '#1677ff',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 0.8s linear infinite',
  },
  error: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
  },
}
