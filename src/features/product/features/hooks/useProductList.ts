import { useQuery } from '@tanstack/react-query'
import { getProductList } from '@/api'
import type { ProductListResponse } from '@/types'

export interface ProductListParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
}

// useQuery 的 queryKey 是缓存的唯一标识
// ['products', params] 表示 params 对象变化时，会重新请求
// 如果 params 不变，直接读缓存，不会发请求
const PRODUCT_LIST_KEY = ['products']

export function useProductList(params: ProductListParams = {}) {
  return useQuery<ProductListResponse>({
    queryKey: [...PRODUCT_LIST_KEY, params],
    queryFn: () => getProductList(params),
  })
}
