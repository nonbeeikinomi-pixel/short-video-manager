import { cn } from '@/lib/utils'
import type { VideoStatus } from '@/types'
import { STATUS_COLORS } from '@/types'

interface BadgeProps {
  label: string
  className?: string
  variant?: 'default' | 'status'
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: VideoStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[status])}>
      {status}
    </span>
  )
}
