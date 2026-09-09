export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-6 h-6 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }
  return (
    <div
      className={`${sizeMap[size]} border-gray-200 border-t-primary rounded-full animate-spin`}
    />
  )
}
