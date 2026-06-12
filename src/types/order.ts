/** 订单类型定义 */

export interface OrderItem {
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  address: ShippingAddress
  phone: string
  createdAt: string
  updatedAt: string
}

export interface ShippingAddress {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderDetailResponse {
  order: Order
}

export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

/** 下单请求 */
export interface CheckoutRequest {
  items: Array<{ productId: number; quantity: number }>
  address: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    detail: string
  }
}

/** 下单响应 */
export interface CheckoutResponse {
  orderId: string
  totalAmount: number
}
