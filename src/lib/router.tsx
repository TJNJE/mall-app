import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query'
import App from '../App'
import ProductListPage from '@/features/product/features/pages/ProductListPage'
import ProductDetailPage from '@/features/product/features/pages/ProductDetailPage'
import CheckoutPage from '@/features/order/features/pages/CheckoutPage'
import OrderSuccessPage from '@/features/order/features/pages/OrderSuccessPage'
import OrderListPage from '@/features/order/features/pages/OrderListPage'
import OrderDetailPage from '@/features/order/features/pages/OrderDetailPage'

export function RouterProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
