import { setupWorker } from 'msw/browser'
import { http, delay } from 'msw'
import {
  mockGetProducts,
  mockGetProduct,
  mockCheckout,
  mockGetOrders,
  mockGetOrder,
} from './handlers'

// 模拟网络延迟
async function json<T>(data: T, status = 200): Promise<Response> {
  await delay(300)
  return Response.json({ code: 0, message: 'success', data }, { status })
}

// 模拟随机 500 错误（约 5% 概率）
function maybeFail(): void {
  if (Math.random() < 0.05) {
    throw new Error('服务器内部错误')
  }
}

export const worker = setupWorker(
  // 登录
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json()
    const { username } = body as { username: string }
    void username
    return json({ token: `token_${Date.now()}` })
  }),

  // 商品列表
  http.get('/api/products', async ({ request }) => {
    maybeFail()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const keyword = url.searchParams.get('keyword') || undefined
    const { list, total } = mockGetProducts(page, pageSize, keyword)
    return json({ list, total, page, pageSize })
  }),

  // 商品详情
  http.get('/api/products/:id', async ({ params }) => {
    maybeFail()
    const id = Number(params.id)
    const product = mockGetProduct(id)
    if (!product) {
      return json({ code: 404, message: '商品不存在', data: null }, 404)
    }
    return json(product)
  }),

  // 下单
  http.post('/api/orders', async ({ request }) => {
    maybeFail()
    const body = await request.json()
    const { items, address } = body as {
      items: Array<{ productId: number; quantity: number }>
      address: Record<string, string>
    }
    const productIds = items.map((item) => item.productId)
    const quantities = items.map((item) => item.quantity)
    const result = mockCheckout(productIds, quantities, address)
    return json(result)
  }),

  // 订单列表
  http.get('/api/orders', async ({ request }) => {
    maybeFail()
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const { list, total } = mockGetOrders(page, pageSize)
    return json({ list, total, page, pageSize })
  }),

  // 订单详情
  http.get('/api/orders/:id', async ({ params }) => {
    maybeFail()
    const order = mockGetOrder(params.id as string)
    if (!order) {
      return json({ code: 404, message: '订单不存在', data: null }, 404)
    }
    return json(order)
  }),
)
