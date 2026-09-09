import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderList } from '@/api'
import type { OrderListResponse } from '@/types'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: '#faad14' },
  paid: { label: '已付款', color: '#1677ff' },
  shipped: { label: '已发货', color: '#722ed1' },
  completed: { label: '已完成', color: '#52c41a' },
  cancelled: { label: '已取消', color: '#999' },
}

function OrderCard({
  order,
}: {
  order: { id: string; totalAmount: number; status: string; createdAt: string }
}) {
  const navigate = useNavigate()
  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-shadow duration-200 hover:shadow-md"
      onClick={() => {
        void navigate(`/order/${order.id}`)
      }}
    >
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
        <span className="text-xs text-gray-400">订单号：{order.id}</span>
        <span
          className={`text-xs font-medium ${order.status === 'pending' ? 'text-yellow-500' : order.status === 'paid' ? 'text-blue-500' : order.status === 'shipped' ? 'text-purple-600' : order.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`}
        >
          {statusInfo.label}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-800">¥{order.totalAmount.toFixed(2)}</span>
        <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>
    </div>
  )
}

export default function OrderListPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<OrderListResponse>({
    queryKey: ['orders', page],
    queryFn: () => getOrderList({ page, pageSize: 10 }),
    staleTime: 0,
  })

  const orders = data?.list ?? []
  const total = data?.total ?? 0

  if (isLoading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-5">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-base">暂无订单</div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {orders.map(
              (order: { id: string; totalAmount: number; status: string; createdAt: string }) => (
                <OrderCard key={order.id} order={order} />
              ),
            )}
          </div>

          {total > 10 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
                disabled={page === 1}
                style={{ opacity: page === 1 ? 0.4 : 1 }}
                onClick={() => setPage((p) => p - 1)}
              >
                上一页
              </button>
              <span className="text-sm text-gray-600">第 {page} 页</span>
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
                disabled={orders.length < 10}
                style={{ opacity: orders.length < 10 ? 0.4 : 1 }}
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
