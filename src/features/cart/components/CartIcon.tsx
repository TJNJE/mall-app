import { Link } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'

export default function CartIcon() {
  const count = useCartStore((s) => s.getCount())

  if (count === 0) return null

  return (
    <Link to="/cart" className="relative no-underline text-gray-700 text-sm py-2">
      购物车
      <span className="absolute top-0 -right-4 bg-red-500 text-white text-[11px] min-w-[16px] h-4 leading-4 rounded-full text-center px-1">
        {count}
      </span>
    </Link>
  )
}
