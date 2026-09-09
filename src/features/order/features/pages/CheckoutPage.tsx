import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getProductDetail } from '@/api'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { useCartStore } from '@/features/cart/stores/cartStore'
import { useToast } from '@/common/components/ToastProvider'
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
  const cartItems: CartItemParam[] = fromCart
    ? (JSON.parse(rawItems ?? '[]') as CartItemParam[])
    : []

  const { mutate: checkout, isPending } = useCreateOrder()
  const clearCart = useCartStore((s) => s.clear)
  const { error: showError } = useToast()

  // 购物车商品详情：并发拉取所有商品
  const { data: productsMap } = useQuery({
    queryKey: ['checkout-products', cartItems],
    queryFn: async () => {
      const map = new Map<number, Product>()
      await Promise.all(
        cartItems.map(async ({ productId }) => {
          try {
            const product = await getProductDetail(productId)
            map.set(productId, product)
          } catch {
            // 某个商品请求失败，跳过
          }
        }),
      )
      return map
    },
    enabled: fromCart && cartItems.length > 0,
    staleTime: 0,
  })

  // 商品页直接下单：拉取单个商品详情
  const productIdFromUrl = Number(searchParams.get('id')) || 1
  const { data: singleProduct } = useQuery({
    queryKey: ['checkout-product', productIdFromUrl],
    queryFn: () => getProductDetail(productIdFromUrl),
    enabled: !fromCart,
    staleTime: 0,
  })

  // 构建显示的商品列表
  let items: Array<{
    productId: number
    name: string
    price: number
    image: string
    quantity: number
  }> = []
  let allLoaded = false

  if (fromCart && productsMap) {
    items = cartItems.map(({ productId, quantity }) => {
      const cached = productsMap.get(productId)
      return {
        productId,
        name: cached?.name ?? '商品详情加载中...',
        price: cached?.price ?? 0,
        image: cached?.image ?? '',
        quantity,
      }
    })
    allLoaded = true
  } else if (!fromCart && singleProduct) {
    const quantity = Number(searchParams.get('quantity')) || 1
    items = [
      {
        productId: singleProduct.id,
        name: singleProduct.name,
        price: singleProduct.price,
        image: singleProduct.image,
        quantity,
      },
    ]
    allLoaded = true
  }

  const canSubmit = allLoaded && items.length > 0
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
    const orderItems = items.map((item) => ({
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
          void navigate(`/order/success?orderId=${data.orderId}`)
        },
        onError: (err) => {
          showError(err instanceof Error ? err.message : '下单失败')
        },
      },
    )
  }

  // 加载中
  if (!canSubmit) {
    return (
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">确认订单</h1>
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
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
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
          收货信息
        </h2>
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
        <h2 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
          商品信息
        </h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <img
                src={item.image || undefined}
                alt={item.name}
                loading="lazy"
                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
              />
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
          className="w-full py-3.5 text-base font-semibold bg-primary text-white border-0 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
          onClick={(e) => {
            void handleSubmit(onSubmit)(e)
          }}
        >
          {isPending ? '提交中...' : '提交订单'}
        </button>
      </div>
    </div>
  )
}
