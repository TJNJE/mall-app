import { useParams, useNavigate } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import { useCartStore } from '@/features/cart/stores/cartStore'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const productId = Number(id)

  const { data: product, isLoading, error } = useProductDetail(productId)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
    })
    navigate('/cart')
  }

  const handleBuyNow = () => {
    if (!product) return
    navigate(`/checkout?id=${productId}&quantity=1`)
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div
          className="w-9 h-9 border-[3px] border-gray-200 border-t-primary rounded-full mx-auto mb-4 animate-spin"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
        <p>加载中...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>商品不存在或加载失败</p>
        <button className="border border-gray-300 bg-white px-4 py-2 rounded-lg cursor-pointer text-sm" onClick={() => navigate('/')}>
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button className="border border-gray-300 bg-white px-4 py-2 rounded-lg cursor-pointer text-sm mb-5" type="button" onClick={() => navigate('/')}>
        ← 返回
      </button>

      <div className="flex gap-10 bg-white p-8 rounded-lg border border-gray-200">
        <div className="w-[480px] flex-shrink-0">
          <img src={product.image} alt={product.name} loading="lazy" className="w-full h-[480px] object-cover rounded-lg" />
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-4 leading-relaxed">{product.name}</h1>

          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-2 mb-5">
              {product.tags.map((tag) => (
                <span key={tag} className="text-sm px-2 py-0.5 bg-red-50 text-red-500 rounded border border-red-200">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-7 pb-5 border-b border-gray-100">
            <span className="text-3xl font-bold text-red-600">¥{product.price}</span>
            <span className="text-sm text-gray-500 line-through">¥{product.originalPrice}</span>
            <span className="text-xs text-white bg-red-500 px-2 py-0.5 rounded">省 ¥{product.originalPrice - product.price}</span>
          </div>

          <div className="flex mb-3.5 text-sm">
            <span className="w-20 text-gray-500 flex-shrink-0">分类</span>
            <span className="text-gray-800">{product.category}</span>
          </div>

          <div className="flex mb-3.5 text-sm">
            <span className="w-20 text-gray-500 flex-shrink-0">库存</span>
            <span className={product.stock > 0 ? 'text-gray-800' : 'text-[#ff4d4f]'}>
              {product.stock > 0 ? `有货（${product.stock}件）` : '暂时缺货'}
            </span>
          </div>

          <div className="flex mb-3.5 text-sm">
            <span className="w-20 text-gray-500 flex-shrink-0">评分</span>
            <span className="text-gray-800">
              {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
              {' '}{product.rating}
            </span>
          </div>

          <div className="flex mb-3.5 text-sm">
            <span className="w-20 text-gray-500 flex-shrink-0">评价数</span>
            <span className="text-gray-800">{product.reviews.toLocaleString()}</span>
          </div>

          <div className="mt-7 pt-5 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-3">商品介绍</h3>
            <p className="text-sm text-gray-600 leading-[1.8]">{product.description}</p>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100 flex gap-3">
            <button
              className={`flex-1 py-3.5 text-base font-semibold text-white border-0 rounded-lg cursor-pointer ${product.stock <= 0 ? 'opacity-50' : 'bg-primary'}`}
              disabled={product.stock <= 0}
              onClick={handleBuyNow}
            >
              立即购买
            </button>
            <button
              className={`flex-1 py-3.5 text-base font-semibold border rounded-lg cursor-pointer ${product.stock <= 0 ? 'opacity-50' : 'bg-white text-primary border-primary'}`}
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
            >
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
