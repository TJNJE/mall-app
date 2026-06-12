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
    <div style={styles.container}>
      <h1 style={styles.heading}>登录</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <button style={styles.btn} type="submit">
          登录
        </button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 400,
    margin: '100px auto',
    padding: 32,
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #f0f0f0',
    textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    color: '#333',
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  input: {
    padding: '12px 16px',
    fontSize: 14,
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    outline: 'none',
  },
  btn: {
    padding: '12px 0',
    fontSize: 16,
    fontWeight: 600,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
