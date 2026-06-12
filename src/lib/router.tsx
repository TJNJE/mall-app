import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query'
import { hydrateAuth } from './hydrateAuth'
import AuthGuard from './AuthGuard'
import App from '../App'
import ProductListPage from '@/features/product/features/pages/ProductListPage'
import ProductDetailPage from '@/features/product/features/pages/ProductDetailPage'
import CartPage from '@/features/cart/features/pages/CartPage'
import LoginPage from '@/features/auth/components/LoginPage'
import CheckoutPage from '@/features/order/features/pages/CheckoutPage'
import OrderSuccessPage from '@/features/order/features/pages/OrderSuccessPage'
import OrderListPage from '@/features/order/features/pages/OrderListPage'
import OrderDetailPage from '@/features/order/features/pages/OrderDetailPage'

export function RouterProvider() {
  hydrateAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/checkout"
              element={
                <AuthGuard>
                  <CheckoutPage />
                </AuthGuard>
              }
            />
            <Route
              path="/order/success"
              element={
                <AuthGuard>
                  <OrderSuccessPage />
                </AuthGuard>
              }
            />
            <Route
              path="/orders"
              element={
                <AuthGuard>
                  <OrderListPage />
                </AuthGuard>
              }
            />
            <Route
              path="/order/:id"
              element={
                <AuthGuard>
                  <OrderDetailPage />
                </AuthGuard>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
