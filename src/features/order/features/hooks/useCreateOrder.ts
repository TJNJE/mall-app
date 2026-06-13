import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/api'
import type { CheckoutRequest, CheckoutResponse } from '@/types'

// 下单 mutation
// mutation 不会缓存，每次调用都会发新请求
// 成功后可以用 queryClient.invalidateQueries 让订单列表失效
export function useCreateOrder() {
  return useMutation<CheckoutResponse, Error, CheckoutRequest>({
    mutationFn: (data: CheckoutRequest) => createOrder(data) as unknown as Promise<CheckoutResponse>,
    // 下单成功后不自动刷新任何查询，由页面组件手动 invalidation
  })
}
