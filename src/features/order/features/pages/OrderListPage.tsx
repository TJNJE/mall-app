import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderList } from '@/api'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: '#faad14' },
  paid: { label: '已付款', color: '#1677ff' },
  shipped: { label: '已发货', color: '#722ed1' },
  completed: { label: '已完成', color: '#52c41a' },
  cancelled: { label: '已取消', color: '#999' },
}

function OrderCard({ order }: { order: { id: string; totalAmount: number; status: string; createdAt: string; productIds: number[] } }) {
  const navigate = useNavigate()
  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' }

  return (
    <div style={styles.card} onClick={() => navigate(`/order/${order.id}`)}>
      <div style={styles.cardHeader}>
        <span style={styles.orderId}>订单号：{order.id}</span>
        <span style={{ ...styles.status, color: statusInfo.color }}>{statusInfo.label}</span>
      </div>
      <div style={styles.cardBody}>
        <span style={styles.amount}>¥{order.totalAmount.toFixed(2)}</span>
        <span style={styles.date}>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
      </div>
    </div>
  )
}

export default function OrderListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => getOrderList({ page, pageSize: 10 }),
  })

  const orders = data?.list ?? []
  const total = data?.total ?? 0

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.heading}>我的订单</h1>

      {orders.length === 0 ? (
        <div style={styles.empty}>暂无订单</div>
      ) : (
        <>
          <div style={styles.list}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {total > 10 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </button>
              <span style={styles.pageInfo}>第 {page} 页</span>
              <button
                style={{ ...styles.pageBtn, opacity: orders.length < 10 ? 0.4 : 1 }}
                disabled={orders.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: '#333',
    marginBottom: 20,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #f0f0f0',
    padding: 16,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #f5f5f5',
  },
  orderId: {
    fontSize: 13,
    color: '#999',
  },
  status: {
    fontSize: 13,
    fontWeight: 500,
  },
  cardBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: 600,
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  pageBtn: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
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
  empty: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
    fontSize: 16,
  },
}
