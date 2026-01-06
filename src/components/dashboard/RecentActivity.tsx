'use client'

import Link from 'next/link'
import { Phone, User, Shield, FileText } from 'lucide-react'
import type { RecentActivityItem } from '@/lib/hooks/useDashboardStats'

interface RecentActivityProps {
  items: RecentActivityItem[]
}

const typeIcons: Record<string, React.ReactNode> = {
  request: <FileText className="h-4 w-4 text-yellow-500" />,
  communication: <Phone className="h-4 w-4 text-blue-500" />,
  military: <Shield className="h-4 w-4 text-indigo-500" />,
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items || items.length === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground">
        Δεν υπάρχει πρόσφατη δραστηριότητα
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            {typeIcons[item.type] || <User className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.date)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            {item.citizen && (
              <Link
                href={`/dashboard/citizens/${item.citizen.id}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                {item.citizen.surname} {item.citizen.first_name}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
