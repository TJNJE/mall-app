import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/api'

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
    queryFn: () => getOrderDetail(id || ''),
    enabled: !!id,
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p>加载中...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>订单不存在</p>
        <button className="border border-gray-300 bg-white px-4 py-2 rounded-lg cursor-pointer text-sm mb-5" onClick={() => navigate('/orders')}>
          返回订单列表
        </button>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#999' }

  return (
    <div className="max-w-[800px] mx-auto">
      <button className="border border-gray-300 bg-white px-4 py-2 rounded-lg cursor-pointer text-sm mb-5" onClick={() => navigate('/orders')}>
        ← 返回
      </button>

      <h1 className="text-xl font-semibold text-gray-800 mb-5">订单详情</h1>

      {/* 订单状态 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">订单状态</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: statusInfo.color }} />
          <span className="text-base font-medium text-gray-800">{statusInfo.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">订单号</span>
            <span className="text-gray-800">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">创建时间</span>
            <span className="text-gray-800">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 收货信息 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">收货信息</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">收货人</span>
            <span className="text-gray-800">{order.address.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">联系电话</span>
            <span className="text-gray-800">{order.address.phone}</span>
          </div>
          <div className="flex justify-between text-sm col-span-2">
            <span className="text-gray-400">详细地址</span>
            <span className="text-gray-800">
              {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
            </span>
          </div>
        </div>
      </div>

      {/* 商品信息 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">商品信息</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg mb-2">
            <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-cover rounded" />
            <div className="flex-1 flex items-center gap-3">
              <h3 className="text-sm font-medium text-gray-800 flex-1">{item.productName}</h3>
              <span className="text-sm text-red-600 font-semibold">¥{item.price}</span>
              <span className="text-sm" style={{ fontSize: 13, color: '#999' }}>{`x${item.quantity}`}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 金额汇总 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex justify-between text-base font-semibold text-gray-800">
          <span>商品总金额</span>
          <span className="text-xl text-red-600">¥{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
