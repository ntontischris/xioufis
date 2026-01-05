'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface CollapsibleFiltersProps {
  children: React.ReactNode
  hasFilters: boolean
  onClear: () => void
  activeFilterCount?: number
}

export function CollapsibleFilters({
  children,
  hasFilters,
  onClear,
  activeFilterCount = 0
}: CollapsibleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-2">
      {/* Mobile toggle button */}
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1"
        >
          <Filter className="h-4 w-4 mr-2" />
          Φίλτρα
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-auto" />
          )}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile collapsible filters */}
      <div className={cn(
        'md:hidden transition-all duration-200 ease-in-out overflow-hidden',
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="flex flex-col gap-2 p-3 bg-muted/30 rounded-lg">
          {children}
        </div>
      </div>

      {/* Desktop filters - always visible */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {children}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="mr-1 h-4 w-4" />
            Καθαρισμός
          </Button>
        )}
      </div>
    </div>
  )
}
