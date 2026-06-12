import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductList } from '../hooks/useProductList'

// 商品卡片
function ProductCard({ product }: { product: { id: number; name: string; price: number; image: string; tags?: string[] } }) {
  const navigate = useNavigate()

  return (
    <div
      style={styles.card}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img src={product.image} alt={product.name} style={styles.image} />
      <div style={styles.cardBody}>
        <h3 style={styles.title}>{product.name}</h3>
        <div style={styles.priceRow}>
          <span style={styles.price}>¥{product.price}</span>
          {product.tags && product.tags.length > 0 && (
            <span style={styles.tag}>{product.tags[0]}</span>
          )}
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
    <div style={styles.pagination}>
      <button
        style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </button>
      <span style={styles.pageInfo}>
        第 {page} / {totalPages} 页，共 {total} 条
      </span>
      <button
        style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
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

  // 用 queryKey 的变化触发重新请求
  // 和 Vue 的 computed/watch 类似，keyword 或 page 变了，useQuery 自动重新请求
  const { data, isLoading } = useProductList({
    page,
    pageSize: 8,
    keyword: keyword || undefined,
  })

  const products = data?.list ?? []
  const total = data?.total ?? 0

  // 防抖：用户输入结束后 500ms 再搜索，避免每次按键都发请求
  // （Vue 中你也会用 @input 事件 + setTimeout 做类似处理）
  const [searchInput, setSearchInput] = useState('')
  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={styles.heading}>商品列表</h1>

      {/* 搜索栏 */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="搜索商品名称..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.searchInput}
        />
        <button style={styles.searchBtn} onClick={handleSearch}>
          搜索
        </button>
      </div>

      {/* 商品网格 */}
      {products.length === 0 ? (
        <div style={styles.empty}>没有找到相关商品</div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 分页 */}
      <Pagination
        page={page}
        pageSize={8}
        total={total}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  searchBar: {
    display: 'flex',
    gap: 10,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    outline: 'none',
  },
  searchBtn: {
    padding: '10px 24px',
    fontSize: 14,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: 240,
    objectFit: 'cover',
  },
  cardBody: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#333',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e74c3c',
  },
  tag: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#fff1f0',
    color: '#ff4d4f',
    borderRadius: 3,
    border: '1px solid #ffccc7',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 32,
  },
  pageBtn: {
    padding: '8px 16px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #f3f3f3',
    borderTopColor: '#1677ff',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 0.8s linear infinite',
  },
  empty: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
    fontSize: 16,
  },
}
