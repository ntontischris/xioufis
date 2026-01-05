'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function MobileCard({ children, className, onClick }: MobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50 active:bg-muted',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface MobileCardRowProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function MobileCardRow({ label, children, className }: MobileCardRowProps) {
  return (
    <div className={cn('flex items-start justify-between gap-2 py-1', className)}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-right">{children}</span>
    </div>
  )
}

interface MobileCardHeaderProps {
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function MobileCardHeader({ children, className, action }: MobileCardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2 pb-2 mb-2 border-b', className)}>
      <div className="font-medium">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

interface ResponsiveTableWrapperProps {
  children: React.ReactNode
  mobileView: React.ReactNode
}

// Wrapper that shows table on desktop, cards on mobile
export function ResponsiveTableWrapper({ children, mobileView }: ResponsiveTableWrapperProps) {
  return (
    <>
      {/* Desktop: Show table */}
      <div className="hidden md:block">
        {children}
      </div>
      {/* Mobile: Show cards */}
      <div className="md:hidden space-y-3">
        {mobileView}
      </div>
    </>
  )
}
