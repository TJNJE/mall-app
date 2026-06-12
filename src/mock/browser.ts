import { setupWorker } from 'msw/browser'
import { http, delay } from 'msw'
import { mockGetProducts, mockGetProduct, mockCheckout, mockGetOrders, mockGetOrder } from './handlers'

// 模拟网络延迟
async function json<T>(data: T, status = 200): Promise<Response> {
  await delay(300)
  return Response.json({ code: 0, message: 'success', data }, { status })
}

export const worker = setupWorker(
  // 登录（POST /api/auth/login）
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { username } = body as { username: string }
    // 简单登录，任何用户名都成功
    void username // eslint-disable-line @typescript-eslint/no-unused-vars
    return json({ token: `token_${Date.now()}` })
  }),

  // 商品列表（GET /api/products?page=1&pageSize=10&keyword=xxx）
  http.get('/api/products', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword') || undefined
    const { list, total } = mockGetProducts(page, pageSize, keyword)
    return json({ list, total, page, pageSize })
  }),

  // 商品详情（GET /api/products/:id）
  http.get('/api/products/:id', async ({ params }) => {
    const id = Number(params.id)
    const product = mockGetProduct(id)
    if (!product) {
      return json({ code: 404, message: '商品不存在', data: null }, 404)
    }
    return json(product)
  }),

  // 下单（POST /api/orders）
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json()
    const { items, address } = body as { items: Array<{ productId: number; quantity: number }>; address: Record<string, string> }
    const productIds = items.map((item) => item.productId)
    const quantities = items.map((item) => item.quantity)
    const result = mockCheckout(productIds, quantities, address)
    return json(result)
  }),

  // 订单列表（GET /api/orders?page=1&pageSize=10）
  http.get('/api/orders', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const { list, total } = mockGetOrders(page, pageSize)
    return json({ list, total, page, pageSize })
  }),

  // 订单详情（GET /api/orders/:id）
  http.get('/api/orders/:id', async ({ params }) => {
    const order = mockGetOrder(params.id as string)
    if (!order) {
      return json({ code: 404, message: '订单不存在', data: null }, 404)
    }
    return json(order)
  }),
)
