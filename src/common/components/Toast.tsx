import type { ToastMessage } from './toastTypes'

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

export default function Toast({ type, message }: { type: ToastMessage['type']; message: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded shadow-md text-sm max-w-[300px] border-l-4" style={{ borderLeftColor: COLORS[type] }}>
      <span className="text-gray-800" style={{ color: COLORS[type], fontWeight: 700 }}>{ICONS[type]}</span>
      <span className="text-gray-800">{message}</span>
    </div>
  )
}
