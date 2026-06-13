import type { CSSProperties } from 'react'

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        borderRadius,
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  )
}
