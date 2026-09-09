import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useProductList } from '../hooks/useProductList'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useProductList', () => {
  it('拉取商品列表并解包 data', async () => {
    const { result } = renderHook(() => useProductList(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.list).toHaveLength(2)
    expect(result.current.data?.total).toBe(2)
  })

  it('把 keyword 参数透传给接口', async () => {
    const { result } = renderHook(() => useProductList({ keyword: '手机' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.list[0].name).toContain('手机')
  })
})
