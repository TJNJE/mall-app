/**
 * 类型单一真源：docs/api/openapi.yaml（经 openapi-typescript 生成 src/api/schema.d.ts）。
 * wire 类型一律从生成 schema 提取，本文件不手写 wire 模型（S3 契约治理）。
 * ApiResponse<T> / PaginationParams 为前端解包/分页辅助类型，非 wire schema。
 */
import type { components } from '@/api/schema'

type S = components['schemas']

// ---------- 契约生成的 wire 模型（data 内容模型，与域模型同名） ----------
export type Product = S['Product']
export type ProductListResponse = S['ProductListResponse']
export type Category = S['Category']
export type OrderStatus = S['OrderStatus']
export type OrderItem = S['OrderItem']
export type ShippingAddress = S['ShippingAddress']
export type Order = S['Order']
export type OrderDetailResponse = S['OrderDetailResponse']
export type OrderListResponse = S['OrderListResponse']
export type CheckoutRequest = S['CheckoutRequest']
export type CheckoutResponse = S['CheckoutResponse']
export type ApiError = S['ApiError']

// ---------- 响应 Envelope → data 提取 ----------
type Data<E> = E extends { data: infer D } ? D : never
export type LoginResponse = Data<S['LoginResponseEnvelope']>

// ---------- 前端辅助类型（非 wire schema） ----------
/** 统一响应包装模式（解包约定，request.ts 使用；wire 中按端点以 *Envelope 展开） */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页参数（query 约定） */
export interface PaginationParams {
  page?: number
  pageSize?: number
}
