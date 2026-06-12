/** 商品类型定义 */

export interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  description: string
  category: string
  stock: number
  rating: number
  reviews: number
  tags?: string[]
}

export interface ProductListResponse {
  list: Product[]
  total: number
  page: number
  pageSize: number
}

/** 商品分类 */
export interface Category {
  id: number
  name: string
  parentId: number | null
}
