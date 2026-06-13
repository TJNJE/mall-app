import products from './products'
import type { OrderItem, ShippingAddress } from '@/types'

const STORAGE_KEY = '__mall_orders__'

interface MockOrder {
  id: string
  items: OrderItem[]
  totalAmount: number
  status: string
  address: ShippingAddress
  phone: string
  createdAt: string
  updatedAt: string
}

function getOrders(): MockOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return []
}

function saveOrders(list: MockOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

const orders: MockOrder[] = getOrders()

// 根据已有订单中最大的 ID 恢复计数器，避免 ID 冲突
let orderCounter = 1000
for (const order of orders) {
  const num = parseInt(order.id.replace('ORD', ''), 10)
  if (!isNaN(num) && num > orderCounter) {
    orderCounter = num
  }
}

/** 获取商品列表（支持分页和搜索） */
export function mockGetProducts(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
): { list: typeof products; total: number } {
  let filtered = products
  if (keyword) {
    filtered = products.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()))
  }
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)
  return { list, total: filtered.length }
}

/** 获取单个商品详情 */
export function mockGetProduct(id: number) {
  return products.find((p) => p.id === id)
}

/** 下单 */
export function mockCheckout(
  productIds: number[],
  quantities: number[],
  address: Record<string, string>,
): { orderId: string; totalAmount: number } {
  orderCounter++
  const orderId = `ORD${orderCounter}`

  const items: OrderItem[] = productIds
    .map((id, idx) => {
      const product = products.find((p) => p.id === id)
      if (!product) return null
      return {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: quantities[idx] || 1,
      }
    })
    .filter(Boolean) as OrderItem[]

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const now = new Date().toISOString()

  const order: MockOrder = {
    id: orderId,
    items,
    totalAmount,
    status: 'pending',
    address: {
      name: address.name || '',
      phone: address.phone || '',
      province: address.province || '',
      city: address.city || '',
      district: address.district || '',
      detail: address.detail || '',
    },
    phone: address.phone || '',
    createdAt: now,
    updatedAt: now,
  }
  orders.push(order)
  saveOrders(orders)
  return { orderId, totalAmount }
}

/** 获取订单列表 */
export function mockGetOrders(page: number = 1, pageSize: number = 10): { list: MockOrder[]; total: number } {
  const start = (page - 1) * pageSize
  const list = orders.slice(start, start + pageSize)
  return { list, total: orders.length }
}

/** 获取订单详情 */
export function mockGetOrder(id: string) {
  return orders.find((o: MockOrder) => o.id === id)
}
