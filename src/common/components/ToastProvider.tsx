/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import type { ToastMessage } from './toastTypes'
import Toast from './Toast'

interface ToastContextValue {
  toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    warning: (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    warning: (msg: string) => addToast('warning', msg),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <Toast key={t.id} type={t.type} message={t.message} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 80,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
}
