'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

// Route name translations
const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'citizens': 'Πολίτες',
  'requests': 'Αιτήματα',
  'communications': 'Επικοινωνίες',
  'military': 'Στρατιωτικό Προσωπικό',
  'settings': 'Ρυθμίσεις',
  'new': 'Νέο',
  'edit': 'Επεξεργασία',
}

interface BreadcrumbItem {
  label: string
  href: string
  isLast: boolean
}

interface BreadcrumbProps {
  customLabel?: string // For dynamic pages like citizen name
  className?: string
}

export function Breadcrumb({ customLabel, className }: BreadcrumbProps) {
  const pathname = usePathname()

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1

      // Skip UUID-like segments but use customLabel for them if provided
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)

      if (isUuid && customLabel) {
        items.push({
          label: customLabel,
          href: currentPath,
          isLast
        })
      } else if (!isUuid) {
        const label = routeNames[segment] || segment
        items.push({
          label,
          href: currentPath,
          isLast
        })
      }
    })

    return items
  }

  const breadcrumbs = getBreadcrumbs()

  // Don't show breadcrumbs on main dashboard
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center gap-1">
        <li>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dashboard"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.slice(1).map((item, index) => (
          <li key={item.href} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {item.isLast ? (
              <span className="font-medium text-foreground">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
