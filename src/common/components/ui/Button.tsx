import { cn } from '@/common/lib/cn'
import type { ComponentProps } from 'react'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-primary hover:bg-primary-hover text-white': variant === 'primary',
          'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'secondary',
          'text-gray-500 hover:text-gray-700 hover:bg-gray-50': variant === 'ghost',
          'bg-red-500 hover:bg-red-600 text-white': variant === 'danger',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
