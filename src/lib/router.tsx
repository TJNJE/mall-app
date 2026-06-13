import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './query'
import { hydrateAuth } from './hydrateAuth'
import AuthGuard from './AuthGuard'
import App from '../App'
import ImportingFallback from '@/common/components/ImportingFallback'
import {
  ProductListPage,
  ProductDetailPage,
  CartPage,
  LoginPage,
  CheckoutPage,
  OrderSuccessPage,
  OrderListPage,
  OrderDetailPage,
} from './lazyPages'

function PageWrapper({ Component, name }: { Component: React.ComponentType; name: string }) {
  return (
    <Suspense fallback={<ImportingFallback name={name} />}>
      <Component />
    </Suspense>
  )
}

export function RouterProvider() {
  hydrateAuth()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<PageWrapper Component={ProductListPage} name="商品列表" />} />
            <Route path="/cart" element={<PageWrapper Component={CartPage} name="购物车" />} />
            <Route path="/product/:id" element={<PageWrapper Component={ProductDetailPage} name="商品详情" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/checkout"
              element={
                <AuthGuard>
                  <PageWrapper Component={CheckoutPage} name="下单" />
                </AuthGuard>
              }
            />
            <Route
              path="/order/success"
              element={
                <AuthGuard>
                  <PageWrapper Component={OrderSuccessPage} name="下单成功" />
                </AuthGuard>
              }
            />
            <Route
              path="/orders"
              element={
                <AuthGuard>
                  <PageWrapper Component={OrderListPage} name="订单列表" />
                </AuthGuard>
              }
            />
            <Route
              path="/order/:id"
              element={
                <AuthGuard>
                  <PageWrapper Component={OrderDetailPage} name="订单详情" />
                </AuthGuard>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
