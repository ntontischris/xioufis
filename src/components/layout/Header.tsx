'use client'

import { Bell, Search, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { SearchDialog } from './SearchDialog'
import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'

interface HeaderProps {
  title?: string
  breadcrumbLabel?: string // Custom label for dynamic routes (e.g., citizen name)
}

// Subscribe to dark mode changes via MutationObserver
function subscribeToDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

function getDarkModeSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function Header({ title, breadcrumbLabel }: HeaderProps) {
  const isDark = useSyncExternalStore(subscribeToDarkMode, getDarkModeSnapshot, getServerSnapshot)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleDarkMode = useCallback(() => {
    document.documentElement.classList.toggle('dark')
  }, [])

  return (
    <header className="border-b bg-card px-6 py-3">
      {/* Breadcrumb */}
      <Breadcrumb customLabel={breadcrumbLabel} className="mb-2" />

      {/* Main header row */}
      <div className="flex items-center justify-between">
        {/* Title */}
        <h1 className="text-xl font-semibold">{title || 'Dashboard'}</h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search button */}
        <Button
          variant="outline"
          className="hidden md:flex items-center gap-2 text-muted-foreground w-64 justify-start"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span>Αναζήτηση...</span>
          <kbd className="ml-auto bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
            Ctrl+K
          </kbd>
        </Button>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Search Dialog */}
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        {/* User avatar */}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            ΧΡ
          </AvatarFallback>
        </Avatar>
      </div>
      </div>
    </header>
  )
}
