import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    login(username)
    navigate('/')
  }

  return (
    <div className="max-w-sm mx-auto mt-24 p-8 bg-white rounded-xl border border-gray-200 text-center">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">登录</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="px-4 py-3 text-sm border border-gray-300 rounded-lg outline-none"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <button className="px-0 py-3 text-lg font-semibold bg-primary text-white border-0 rounded-lg cursor-pointer" type="submit">
          登录
        </button>
      </form>
    </div>
  )
}
