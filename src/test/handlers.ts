import { http, HttpResponse } from 'msw'

// 仅拦截 useProductList 依赖的 GET /api/products（Slice A 覆盖目标）。
// 返回结构与 request.ts 的响应拦截器一致：{ code, message, data }，拦截器解包后 data 即业务数据。
export const handlers = [
  // 测试环境 axios baseURL 设为 http://localhost，故 msw handler 必须用绝对 URL 匹配
  // （msw/node 下 '/' 相对路径不会自动套用 origin，否则报 no matching handler）
  http.get('http://localhost/api/products', ({ request }) => {
    const url = new URL(request.url)
    const keyword = url.searchParams.get('keyword') ?? ''

    const list = [
      {
        id: 1,
        name: keyword ? `搜索：${keyword}` : '测试商品A',
        price: 99,
        image: 'https://picsum.photos/200',
        description: '商品A描述',
        category: '数码',
      },
      {
        id: 2,
        name: '测试商品B',
        price: 199,
        image: 'https://picsum.photos/200',
        description: '商品B描述',
        category: '数码',
      },
    ]

    return HttpResponse.json({
      code: 0,
      message: 'ok',
      data: { list, total: list.length },
    })
  }),
]
