'use client'

import { Badge } from '@/components/ui/badge'
import { REQUEST_STATUS_OPTIONS, getLabel } from '@/lib/utils/constants'

interface RequestBadgeProps {
  status: string
  className?: string
}

export function RequestBadge({ status, className }: RequestBadgeProps) {
  const option = REQUEST_STATUS_OPTIONS.find((o) => o.value === status)
  const color = option?.color || 'secondary'

  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    success: 'default',
    warning: 'outline',
    secondary: 'secondary',
    destructive: 'destructive',
  }

  return (
    <Badge
      variant={variantMap[color] || 'secondary'}
      className={`${
        color === 'success'
          ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100'
          : color === 'warning'
          ? 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
          : ''
      } ${className || ''}`}
    >
      {getLabel(REQUEST_STATUS_OPTIONS, status)}
    </Badge>
  )
}
