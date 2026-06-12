import request from '@/lib/request'
import type {
  Product,
  ProductListResponse,
  Order,
  OrderListResponse,
  CheckoutRequest,
  CheckoutResponse,
} from '@/types'

// ========== 商品相关 ==========

export function getProductList(params: { page?: number; pageSize?: number; keyword?: string }) {
  return request.get<ProductListResponse>('/api/products', { params }) as Promise<ProductListResponse>
}

export function getProductDetail(id: number) {
  return request.get<Product>('/api/products/' + id) as Promise<Product>
}

// ========== 订单相关 ==========

export function createOrder(data: CheckoutRequest) {
  return request.post<CheckoutResponse>('/api/orders', data) as Promise<CheckoutResponse>
}

export function getOrderList(params: { page?: number; pageSize?: number }) {
  return request.get<OrderListResponse>('/api/orders', { params }) as Promise<OrderListResponse>
}

export function getOrderDetail(id: string) {
  return request.get<Order>('/api/orders/' + id) as Promise<Order>
}
