import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProductDetail } from '@/features/product/features/hooks/useProductDetail'
import { useCreateOrder } from '../hooks/useCreateOrder'
import { checkoutSchema, type CheckoutForm } from '@/common/lib/formSchemas'
import { Input } from '@/common/components/ui/Input'
import { Textarea } from '@/common/components/ui/Textarea'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productId = Number(searchParams.get('id')) || 1
  const initialQuantity = Number(searchParams.get('quantity')) || 1

  const { data: product } = useProductDetail(productId)
  const { mutate: checkout, isPending } = useCreateOrder()

  // react-hook-form 接管表单：自动管理字段状态、验证、错误
  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      quantity: initialQuantity,
    },
  })

  const quantity = watch('quantity', initialQuantity)
  const totalPrice = product ? product.price * quantity : 0

  const onSubmit = (values: CheckoutForm) => {
    if (!product) return

    checkout(
      {
        items: [{ productId: product.id, quantity }],
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
          navigate(`/order/success?orderId=${data.orderId}`)
        },
      },
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p>加载中...</p>
      </div>
    )
  }

  // 受控组件：手动管理数量
  const handleQuantityChange = (delta: number) => {
    setValue('quantity', Math.max(1, quantity + delta), { shouldValidate: true })
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
        <div className="flex items-center gap-4">
          <img src={product.image} alt={product.name} loading="lazy" className="w-24 h-24 object-cover rounded-lg" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800 mb-2">{product.name}</h3>
            <span className="text-base font-semibold text-red-600">¥{product.price}</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="w-8 h-8 text-lg border border-gray-300 rounded-lg bg-gray-50 cursor-pointer flex items-center justify-center" onClick={() => handleQuantityChange(-1)}>
              -
            </button>
            <span className="text-base min-w-8 text-center">{quantity}</span>
            <button type="button" className="w-8 h-8 text-lg border border-gray-300 rounded-lg bg-gray-50 cursor-pointer flex items-center justify-center" onClick={() => handleQuantityChange(1)}>
              +
            </button>
          </div>
        </div>
      </div>

      {/* 金额汇总 */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-4">
        <div className="flex justify-between mb-3 text-sm text-gray-600">
          <span>商品数量</span>
          <span>{quantity} 件</span>
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
          type="submit"
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
