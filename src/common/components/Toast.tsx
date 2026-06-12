import type { ToastMessage } from './ToastProvider'

const COLORS: Record<string, string> = {
  success: '#52c41a',
  error: '#ff4d4f',
  warning: '#faad14',
}

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
}

export default function Toast({ type, message }: ToastMessage & { id: never }) {
  return (
    <div style={{ ...styles.toast, borderLeftColor: COLORS[type] }}>
      <span style={{ color: COLORS[type], fontWeight: 700 }}>{ICONS[type]}</span>
      <span style={styles.message}>{message}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: '#fff',
    border: '1px solid #f0f0f0',
    borderLeft: '4px solid',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: 14,
    maxWidth: 300,
  },
  message: { color: '#333' },
}
