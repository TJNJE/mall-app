import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getProductDetail } from '@/api'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { checkoutSchema, type CheckoutForm } from '@/common/lib/formSchemas'
import type { Product } from '@/types'
import { Input } from '@/common/components/ui/Input'
import { Textarea } from '@/common/components/ui/Textarea'

interface CartItemParam {
  productId: number
  quantity: number
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // 判断来源：有 items 参数 → 来自购物车；只有 id → 来自商品详情页
  const rawItems = searchParams.get('items')
  const fromCart = !!rawItems
  const cartItems: CartItemParam[] = fromCart ? JSON.parse(rawItems) : []

  const { mutate: checkout, isPending } = useCreateOrder()
  const clearCart = useCartStore((s) => s.clear)

  // 缓存商品详情（key: productId → Product）
  const [productCache, setProductCache] = useState<Map<number, Product>>(new Map())

  // 拉取购物车中所有商品详情
  useEffect(() => {
    if (!fromCart || cartItems.length === 0) return

    setProductCache(prev => {
      const cache = new Map(prev)
      // 先收集缺失的 productId
      const missing = cartItems.filter(({ productId }) => !cache.has(productId)).map(({ productId }) => productId)
      if (missing.length === 0) return prev

      // 并发请求所有缺失的商品
      Promise.all(missing.map(id => getProductDetail(id).catch(() => null))).then(results => {
        results.forEach((res, i) => {
          const id = missing[i]
          // res 可能是 Product 或 Promise 的 resolve 结果（取决于 Axios 拦截器是否已解包）
          // 由于接口返回 { code: 0, data: Product }，拦截器解包后 queryFn 拿到 Product
          // 但这里直接调用 API 函数，返回的是 Promise<Product>
          if (res) {
            cache.set(id, res)
          }
        })
        setProductCache(new Map(cache))
      })

      return cache
    })
  }, [fromCart, cartItems]) // eslint-disable-line react-hooks/exhaustive-deps

  // 构建商品列表
  const items = fromCart
    ? cartItems.map(({ productId, quantity }) => {
        const cached = productCache.get(productId)
        return {
          productId,
          name: cached?.name ?? '加载中...',
          price: cached?.price ?? 0,
          image: cached?.image ?? '',
          quantity,
        }
      })
    : // 商品页直接下单（单件，数量为 URL 参数）
      (() => {
        const productId = Number(searchParams.get('id')) || 1
        const quantity = Number(searchParams.get('quantity')) || 1
        const cached = productCache.get(productId)
        return cached ? [{
          productId,
          name: cached.name,
          price: cached.price,
          image: cached.image,
          quantity,
        }] : []
      })()

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // react-hook-form 接管表单
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
    },
  })

  const onSubmit = (values: CheckoutForm) => {
    const orderItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }))

    checkout(
      {
        items: orderItems,
        address: {
          name: values.name,
          phone: values.phone,
          province: values.province,
          city: values.city,
          district: values.district,
          detail: values.detail,
        },
      },
      {
        onSuccess: (data) => {
          if (fromCart) clearCart()
          navigate(`/order/success?orderId=${data.orderId}`)
        },
      },
    )
  }

  // 商品页需要单独拉取商品详情
  useEffect(() => {
    if (fromCart) return
    const productId = Number(searchParams.get('id')) || 1
    if (!productCache.has(productId)) {
      getProductDetail(productId).then(p => {
        setProductCache(prev => {
          const next = new Map(prev)
          next.set(productId, p)
          return next
        })
      })
    }
  }, [fromCart, productCache]) // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">确认订单</h1>
        <div className="text-center py-16 text-gray-400">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">确认订单</h1>

      {/* 收货信息 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">收货信息</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="姓名"
            error={errors.name?.message}
            placeholder="请输入收货人姓名"
            {...register('name')}
          />
          <Input
            label="手机号"
            error={errors.phone?.message}
            placeholder="请输入收货人手机号"
            {...register('phone')}
          />
          <Input
            label="省份"
            error={errors.province?.message}
            placeholder="请输入省份"
            {...register('province')}
          />
          <Input
            label="城市"
            error={errors.city?.message}
            placeholder="请输入城市"
            {...register('city')}
          />
          <Input
            label="区县"
            error={errors.district?.message}
            placeholder="请输入区县"
            {...register('district')}
          />
          <Textarea
            label="详细地址"
            error={errors.detail?.message}
            placeholder="请输入街道、门牌号等详细地址"
            {...register('detail')}
          />
        </div>
      </div>

      {/* 商品列表 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">商品信息</h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} loading="lazy" className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-800 mb-2">{item.name}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-base font-semibold text-red-600">¥{item.price}</span>
                  <span className="text-sm text-gray-500">x{item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                ¥{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 金额汇总 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <div className="flex justify-between mb-3 text-sm text-gray-600">
          <span>商品数量</span>
          <span>{totalCount} 件</span>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800 font-semibold">合计</span>
            <span className="text-2xl font-bold text-red-600">¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="mb-6">
        <button
          type="button"
          className="w-full py-3.5 text-base font-semibold bg-primary text-white border-0 rounded-lg cursor-pointer"
          disabled={isPending}
          onClick={handleSubmit(onSubmit)}
        >
          {isPending ? '提交中...' : '提交订单'}
        </button>
      </div>
    </div>
  )
}
