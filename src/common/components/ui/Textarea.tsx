import { cn } from '@/common/lib/cn'
import type { ComponentPropsWithoutRef } from 'react'

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  error?: string
  label?: string
  className?: string
}

export function Textarea({ error, label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-700 font-medium">{label}</label>}
      <textarea
        className={cn(
          'px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[80px] font-inherit',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
