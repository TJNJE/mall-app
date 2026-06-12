import { useParams, useNavigate } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productId = Number(id)

  const { data: product, isLoading, error } = useProductDetail(productId)

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>加载中...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={styles.error}>
        <p>商品不存在或加载失败</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 返回按钮 */}
      <button style={styles.backBtn} onClick={() => navigate('/')}>
        ← 返回
      </button>

      <div style={styles.content}>
        {/* 左侧图片 */}
        <div style={styles.left}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>

        {/* 右侧信息 */}
        <div style={styles.right}>
          <h1 style={styles.title}>{product.name}</h1>

          {product.tags && product.tags.length > 0 && (
            <div style={styles.tags}>
              {product.tags.map((tag) => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>
          )}

          <div style={styles.priceBox}>
            <span style={styles.price}>¥{product.price}</span>
            <span style={styles.originalPrice}>¥{product.originalPrice}</span>
            <span style={styles.discount}>省 ¥{product.originalPrice - product.price}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>分类</span>
            <span style={styles.infoValue}>{product.category}</span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>库存</span>
            <span style={{ ...styles.infoValue, color: product.stock > 0 ? '#52c41a' : '#ff4d4f' }}>
              {product.stock > 0 ? `有货（${product.stock}件）` : '暂时缺货'}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>评分</span>
            <span style={styles.infoValue}>
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              {' '}{product.rating}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>评价数</span>
            <span style={styles.infoValue}>{product.reviews.toLocaleString()}</span>
          </div>

          <div style={styles.description}>
            <h3 style={styles.descTitle}>商品介绍</h3>
            <p style={styles.descText}>{product.description}</p>
          </div>

          <div style={styles.action}>
            <button
              style={{
                ...styles.buyBtn,
                opacity: product.stock <= 0 ? 0.5 : 1,
              }}
              disabled={product.stock <= 0}
              onClick={() => navigate(`/checkout?id=${productId}&quantity=1`)}
            >
              {product.stock > 0 ? '立即购买' : '暂时缺货'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  backBtn: {
    border: '1px solid #d9d9d9',
    background: '#fff',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    marginBottom: 20,
  },
  content: {
    display: 'flex',
    gap: 40,
    background: '#fff',
    padding: 32,
    borderRadius: 8,
    border: '1px solid #f0f0f0',
  },
  left: {
    width: 480,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: 480,
    objectFit: 'cover',
    borderRadius: 8,
  },
  right: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: '#333',
    marginBottom: 16,
    lineHeight: 1.4,
  },
  tags: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    fontSize: 12,
    padding: '3px 8px',
    background: '#fff1f0',
    color: '#ff4d4f',
    borderRadius: 3,
    border: '1px solid #ffccc7',
  },
  priceBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: '1px solid #f0f0f0',
  },
  price: {
    fontSize: 32,
    fontWeight: 700,
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecoration: 'line-through',
  },
  discount: {
    fontSize: 13,
    color: '#fff',
    background: '#ff4d4f',
    padding: '2px 8px',
    borderRadius: 3,
  },
  infoRow: {
    display: 'flex',
    marginBottom: 14,
    fontSize: 14,
  },
  infoLabel: {
    width: 80,
    color: '#999',
    flexShrink: 0,
  },
  infoValue: {
    color: '#333',
  },
  description: {
    marginTop: 28,
    paddingTop: 20,
    borderTop: '1px solid #f0f0f0',
  },
  descTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#333',
    marginBottom: 12,
  },
  descText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 1.8,
  },
  action: {
    marginTop: 32,
    paddingTop: 20,
    borderTop: '1px solid #f0f0f0',
  },
  buyBtn: {
    width: '100%',
    padding: '14px 0',
    fontSize: 16,
    fontWeight: 600,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
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
  error: {
    textAlign: 'center',
    padding: 60,
    color: '#999',
  },
}
