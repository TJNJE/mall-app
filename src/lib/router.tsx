import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query'
import App from '../App'
import ProductListPage from '@/features/product/features/pages/ProductListPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>{title}</h1>
      <p style={{ color: '#999' }}>页面开发中...</p>
      <a href="/" style={{ color: '#1677ff' }}>返回首页</a>
    </div>
  )
}

export function RouterProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/product/:id" element={<Placeholder title="商品详情" />} />
            <Route path="/checkout" element={<Placeholder title="下单" />} />
            <Route path="/order/success" element={<Placeholder title="下单成功" />} />
            <Route path="/orders" element={<Placeholder title="我的订单" />} />
            <Route path="/order/:id" element={<Placeholder title="订单详情" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
