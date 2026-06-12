import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟内数据视为有效，不重新请求
      refetchOnWindowFocus: false, // 不自动刷新，避免频繁请求
    },
  },
})

// 导出 queryClient 供其他文件使用（如测试、手动 invalidation）
export { queryClient }
