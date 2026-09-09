import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="text-center py-24 px-5">
      <h1 className="text-2xl font-semibold text-gray-800 mb-3">404 · 页面不存在</h1>
      <p className="text-sm text-gray-400 mb-6">你访问的页面可能已被移除，或地址有误</p>
      <button
        className="px-8 py-3 text-base font-medium bg-primary text-white border-0 rounded-lg cursor-pointer"
        onClick={() => void navigate('/')}
      >
        返回首页
      </button>
    </div>
  )
}
