import { lazy } from 'react'

const ProductListPage = lazy(() => import('@/features/product/features/pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/features/product/features/pages/ProductDetailPage'))
const CartPage = lazy(() => import('@/features/cart/features/pages/CartPage'))
const LoginPage = lazy(() => import('@/features/auth/components/LoginPage'))
const CheckoutPage = lazy(() => import('@/features/order/features/pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('@/features/order/features/pages/OrderSuccessPage'))
const OrderListPage = lazy(() => import('@/features/order/features/pages/OrderListPage'))
const OrderDetailPage = lazy(() => import('@/features/order/features/pages/OrderDetailPage'))

export {
  ProductListPage,
  ProductDetailPage,
  CartPage,
  LoginPage,
  CheckoutPage,
  OrderSuccessPage,
  OrderListPage,
  OrderDetailPage,
}
