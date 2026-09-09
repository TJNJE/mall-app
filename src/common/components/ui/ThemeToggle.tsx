import { useTheme } from '@/common/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      className="border-0 bg-transparent cursor-pointer text-base leading-none px-1"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
