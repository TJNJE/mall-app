import { cn } from '@/common/lib/cn'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-white border border-gray-200 rounded-lg', className)}>{children}</div>
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-4 py-3 border-b border-gray-100', className)}>{children}</div>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-4 py-3', className)}>{children}</div>
}
