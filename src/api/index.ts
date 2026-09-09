import request from '@/lib/request'
import type {
  CheckoutRequest,
  CheckoutResponse,
  Order,
  OrderListResponse,
  Product,
  ProductListResponse,
} from '@/types'

// ========== 认证 ==========

export function login(username: string) {
  return request.post<{ token: string }>('/api/auth/login', { username })
}

// ========== 商品相关 ==========

export function getProductList(params: { page?: number; pageSize?: number; keyword?: string }) {
  return request.get<ProductListResponse>('/api/products', { params })
}

export function getProductDetail(id: number) {
  return request.get<Product>('/api/products/' + id)
}

// ========== 订单相关 ==========

export function createOrder(data: CheckoutRequest) {
  return request.post<CheckoutResponse>('/api/orders', data)
}

export function getOrderList(params: { page?: number; pageSize?: number }) {
  return request.get<OrderListResponse>('/api/orders', { params })
}

export function getOrderDetail(id: string) {
  return request.get<Order>('/api/orders/' + id)
}
