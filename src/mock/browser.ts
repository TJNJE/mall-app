import { setupWorker } from 'msw/browser'
import { http, get, post, delay } from 'msw'
import { mockGetProducts, mockGetProduct, mockCheckout, mockGetOrders, mockGetOrder } from './handlers'
import { ApiResponse } from '@/types'

// 模拟网络延迟
async function respond<T>(data: T, status = 'success'): Promise<ApiResponse<T>> {
  await delay(300)
  return { code: 0, message: status, data }
}

export const worker = setupWorker(
  // 商品列表（GET /api/products?page=1&pageSize=10&keyword=xxx）
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword') || undefined
    const { list, total } = mockGetProducts(page, pageSize, keyword)
    return respond({ list, total, page, pageSize })
  }),

  // 商品详情（GET /api/products/:id）
  http.get('/api/products/:id', async ({ params }) => {
    const id = Number(params.id)
    const product = mockGetProduct(id)
    if (!product) {
      return Response.json({ code: 404, message: '商品不存在', data: null }, { status: 404 })
    }
    return respond(product)
  }),

  // 下单（POST /api/orders）
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json()
    const { items, address } = body as { items: Array<{ productId: number; quantity: number }>; address: Record<string, string> }
    const productIds = items.map((item) => item.productId)
    const amounts = items.reduce((sum, item) => sum + item.quantity, 0)
    const result = mockCheckout(productIds, amounts, address)
    return respond(result)
  }),

  // 订单列表（GET /api/orders?page=1&pageSize=10）
  http.get('/api/orders', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const { list, total } = mockGetOrders(page, pageSize)
    return respond({ list, total, page, pageSize })
  }),

  // 订单详情（GET /api/orders/:id）
  http.get('/api/orders/:id', async ({ params }) => {
    const order = mockGetOrder(params.id as string)
    if (!order) {
      return Response.json({ code: 404, message: '订单不存在', data: null }, { status: 404 })
    }
    return respond(order)
  }),
)
