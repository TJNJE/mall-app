import { useQuery } from '@tanstack/react-query'
import { getProductDetail } from '@/api'

const PRODUCT_DETAIL_KEY = ['product']

// 获取单个商品详情，queryKey 带上 productId 做缓存隔离
// productId 变了 → 自动发新请求
export function useProductDetail(id: number) {
  return useQuery({
    queryKey: [...PRODUCT_DETAIL_KEY, id],
    queryFn: () => getProductDetail(id),
    // 详情数据变更频率低，可以设置较长的 staleTime
    // 这样切回页面时不会重新请求，直接读缓存
    staleTime: 10 * 60 * 1000,
  })
}
