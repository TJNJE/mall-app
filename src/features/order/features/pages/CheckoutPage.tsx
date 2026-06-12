import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProductDetail } from '@/features/product/features/hooks/useProductDetail'
import { useCreateOrder } from '../hooks/useCreateOrder'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productId = Number(searchParams.get('id')) || 1
  const initialQuantity = Number(searchParams.get('quantity')) || 1

  const { data: product } = useProductDetail(productId)
  const { mutate: checkout, isPending } = useCreateOrder()

  // 表单状态
  const [form, setForm] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    quantity: initialQuantity,
  })

  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = '请输入姓名'
  if (!form.phone.trim()) errors.phone = '请输入手机号'
  else if (!/^1\d{10}$/.test(form.phone)) errors.phone = '手机号格式不正确'
  if (!form.province.trim()) errors.province = '请选择省份'
  if (!form.city.trim()) errors.city = '请选择城市'
  if (!form.district.trim()) errors.district = '请选择区域'
  if (!form.detail.trim()) errors.detail = '请填写详细地址'

  const isValid = Object.keys(errors).length === 0
  const totalPrice = product ? product.price * form.quantity : 0

  const handleSubmit = () => {
    if (!isValid || !product) return

    checkout(
      {
        items: [{ productId: product.id, quantity: form.quantity }],
        address: {
          name: form.name,
          phone: form.phone,
          province: form.province,
          city: form.city,
          district: form.district,
          detail: form.detail,
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
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>确认订单</h1>

      {/* 收货信息 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>收货信息</h2>
        <div style={styles.formGrid}>
          <InputField
            label="姓名"
            value={form.name}
            error={errors.name}
            placeholder="请输入收货人姓名"
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <InputField
            label="手机号"
            value={form.phone}
            error={errors.phone}
            placeholder="请输入收货人手机号"
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <InputField
            label="省份"
            value={form.province}
            error={errors.province}
            placeholder="请输入省份"
            onChange={(v) => setForm({ ...form, province: v })}
          />
          <InputField
            label="城市"
            value={form.city}
            error={errors.city}
            placeholder="请输入城市"
            onChange={(v) => setForm({ ...form, city: v })}
          />
          <InputField
            label="区县"
            value={form.district}
            error={errors.district}
            placeholder="请输入区县"
            onChange={(v) => setForm({ ...form, district: v })}
          />
          <div style={styles.fullWidthInput}>
            <label style={styles.label}>详细地址</label>
            <textarea
              style={styles.textarea}
              placeholder="请输入街道、门牌号等详细地址"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
            {errors.detail && <span style={styles.error}>{errors.detail}</span>}
          </div>
        </div>
      </div>

      {/* 商品列表 */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>商品信息</h2>
        <div style={styles.cartItem}>
          <img src={product.image} alt={product.name} style={styles.cartImage} />
          <div style={styles.cartInfo}>
            <h3 style={styles.cartName}>{product.name}</h3>
            <span style={styles.cartPrice}>¥{product.price}</span>
          </div>
          <div style={styles.quantityControl}>
            <button
              style={styles.qtyBtn}
              onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
            >
              -
            </button>
            <span style={styles.qtyValue}>{form.quantity}</span>
            <button
              style={styles.qtyBtn}
              onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 金额汇总 */}
      <div style={styles.summary}>
        <div style={styles.summaryRow}>
          <span>商品数量</span>
          <span>{form.quantity} 件</span>
        </div>
        <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
          <span style={styles.totalLabel}>合计</span>
          <span style={styles.totalPrice}>¥{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* 提交按钮 */}
      <div style={styles.submitArea}>
        <button
          style={{
            ...styles.submitBtn,
            opacity: isPending ? 0.6 : 1,
          }}
          disabled={isPending || !isValid}
          onClick={handleSubmit}
        >
          {isPending ? '提交中...' : '提交订单'}
        </button>
      </div>
    </div>
  )
}

// 表单项组件
function InputField({
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  error?: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div style={styles.formItem}>
      <label style={styles.label}>{label}</label>
      <input
        style={{ ...styles.input, borderColor: error ? '#ff4d4f' : undefined }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: '#333',
    marginBottom: 24,
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fullWidthInput: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: 500,
  },
  input: {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
    fontFamily: 'inherit',
  },
  error: {
    fontSize: 12,
    color: '#ff4d4f',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  cartImage: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: 6,
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
    marginBottom: 8,
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e74c3c',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    fontSize: 18,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    background: '#fafafa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  summary: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    border: '1px solid #f0f0f0',
    marginBottom: 16,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: 600,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e74c3c',
  },
  submitArea: {
    marginBottom: 24,
  },
  submitBtn: {
    width: '100%',
    padding: '14px 0',
    fontSize: 16,
    fontWeight: 600,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
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
}
