import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem } = useCartStore()
  const count = useCartStore((s) => s.getCount())
  const amount = useCartStore((s) => s.getAmount())

  const handleCheckout = () => {
    // 将购物车所有商品 ID + 数量拼成 URL 参数传递给下单页
    const params = new URLSearchParams()
    params.set('items', JSON.stringify(items.map(i => ({ productId: i.productId, quantity: i.quantity }))))
    navigate(`/checkout?${params.toString()}`)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-5">购物车</h1>
        <div className="text-center py-16 text-gray-400">
          <p>购物车是空的</p>
          <button className="px-8 py-3 text-base bg-white text-gray-700 border border-gray-300 rounded-lg cursor-pointer" type="button" onClick={() => navigate('/')}>
            去逛逛
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-5">购物车</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <img src={item.productImage} alt={item.productName} loading="lazy" className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-800 m-0">{item.productName}</h3>
              <span className="text-sm text-red-600 font-semibold">¥{item.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
            <span className="text-sm text-gray-800 font-semibold min-w-[70px] text-right">¥{(item.price * item.quantity).toFixed(2)}</span>
            <button type="button" className="border-0 bg-transparent text-gray-400 cursor-pointer text-xs" onClick={() => removeItem(item.productId)}>
              删除
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-6 mt-5 pb-5">
        <span>共 {count} 件</span>
        <span className="text-xl font-bold text-red-600">合计：¥{amount.toFixed(2)}</span>
        <button className="px-8 py-3 text-base font-semibold bg-primary text-white border-0 rounded-lg cursor-pointer" type="button" onClick={handleCheckout}>
          去结算
        </button>
      </div>
    </div>
  )
}
