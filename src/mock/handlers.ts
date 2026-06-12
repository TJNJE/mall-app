import products from './products'

/** 模拟订单存储 */
let orders: Array<{ id: string; productIds: number[]; totalAmount: number; status: string; createdAt: string }> = []

let orderCounter = 1000

/** 获取商品列表（支持分页和搜索） */
export function mockGetProducts(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
): { list: typeof products; total: number } {
  let filtered = products
  if (keyword) {
    filtered = products.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()))
  }
  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)
  return { list, total: filtered.length }
}

/** 获取单个商品详情 */
export function mockGetProduct(id: number) {
  return products.find((p) => p.id === id)
}

/** 下单 */
export function mockCheckout(
  productIds: number[],
  amounts: number,
  address: Record<string, string>,
): { orderId: string; totalAmount: number } {
  orderCounter++
  const orderId = `ORD${orderCounter}`

  const items = productIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products

  const totalAmount = items.reduce((sum, item) => sum + item.price * amounts, 0)

  const order = {
    id: orderId,
    productIds,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  return { orderId, totalAmount }
}

/** 获取订单列表 */
export function mockGetOrders(page: number = 1, pageSize: number = 10): { list: typeof orders; total: number } {
  const start = (page - 1) * pageSize
  const list = orders.slice(start, start + pageSize)
  return { list, total: orders.length }
}

/** 获取订单详情 */
export function mockGetOrder(id: string) {
  return orders.find((o) => o.id === id)
}
