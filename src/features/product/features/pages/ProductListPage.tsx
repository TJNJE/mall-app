import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductList } from '../hooks/useProductList'
import { Skeleton } from '@/common/components/Skeleton'

// 商品卡片
function ProductCard({
  product,
}: {
  product: { id: number; name: string; price: number; image: string; tags?: string[] }
}) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:shadow-md"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-full h-60 object-cover"
      />
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-700 truncate">{product.name}</h3>
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold text-red-600">¥{product.price}</span>
          {product.tags && product.tags.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded border border-red-200">
              {product.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// 骨架屏卡片
function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton
        width="100%"
        height={240}
        borderRadius={0}
        style={{ borderBottom: '1px solid #f0f0f0' }}
      />
      <div className="p-3">
        <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
        <div className="flex items-baseline justify-between">
          <Skeleton width="30%" height={18} />
          <Skeleton width="50px" height={18} />
        </div>
      </div>
    </div>
  )
}

// 分页组件
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
        style={{ opacity: page === 1 ? 0.4 : 1 }}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>
      <span className="text-sm text-gray-600">
        第 {page} / {totalPages} 页，共 {total} 条
      </span>
      <button
        className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer"
        style={{ opacity: page === totalPages ? 0.4 : 1 }}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </button>
    </div>
  )
}

export default function ProductListPage() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useProductList({
    page,
    pageSize: 8,
    keyword: keyword || undefined,
  })

  const products = data?.list ?? []
  const total = data?.total ?? 0

  const [searchInput, setSearchInput] = useState('')
  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  // 骨架屏：渲染 8 个空卡片占位
  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl mb-5 text-gray-800">商品列表</h1>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl mb-5 text-gray-800">商品列表</h1>

      {/* 搜索栏 */}
      <div className="flex gap-2.5 mb-6">
        <input
          type="text"
          placeholder="搜索商品名称..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none"
        />
        <button
          className="px-6 py-2.5 text-sm bg-primary text-white border-0 rounded-lg cursor-pointer"
          onClick={handleSearch}
        >
          搜索
        </button>
      </div>

      {/* 商品网格 */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-base">没有找到相关商品</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 分页 */}
      <Pagination page={page} pageSize={8} total={total} onPageChange={(p) => setPage(p)} />
    </div>
  )
}
