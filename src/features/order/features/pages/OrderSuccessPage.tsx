import { useSearchParams, useNavigate } from 'react-router-dom'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId') || ''

  return (
    <div className="text-center py-20 px-5">
      <div className="w-20 h-20 rounded-full bg-success text-white text-4xl leading-[5rem] mx-auto mb-6">
        ✓
      </div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-3">下单成功！</h1>
      <p className="text-sm text-gray-400 mb-10">订单号：{orderId}</p>
      <div className="flex gap-4 justify-center">
        <button
          className="px-8 py-3 text-base font-medium bg-primary text-white border-0 rounded-lg cursor-pointer"
          onClick={() => {
            void navigate('/orders')
          }}
        >
          查看订单
        </button>
        <button
          className="px-8 py-3 text-base bg-white text-gray-700 border border-gray-300 rounded-lg cursor-pointer"
          onClick={() => {
            void navigate('/')
          }}
        >
          继续购物
        </button>
      </div>
    </div>
  )
}
