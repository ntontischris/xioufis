'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { globalSearch, type SearchResult, type SearchResults } from '@/lib/actions/search'
import { Search, Users, ClipboardList, MessageSquare, Shield, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const typeIcons = {
  citizen: Users,
  request: ClipboardList,
  communication: MessageSquare,
  military: Shield,
}

const typeLabels = {
  citizen: 'Πολίτες',
  request: 'Αιτήματα',
  communication: 'Επικοινωνίες',
  military: 'Στρατιωτικό Προσωπικό',
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Get flat array of all results for keyboard navigation
  const getAllResults = useCallback((): SearchResult[] => {
    if (!results) return []
    return [
      ...results.citizens,
      ...results.requests,
      ...results.communications,
      ...results.military,
    ]
  }, [results])

  // Search when query changes
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true)
        try {
          const searchResults = await globalSearch(query)
          setResults(searchResults)
          setSelectedIndex(0)
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults(null)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      const allResults = getAllResults()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, allResults.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (allResults[selectedIndex]) {
            router.push(allResults[selectedIndex].href)
            onOpenChange(false)
            setQuery('')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, getAllResults, router, onOpenChange])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
    }
  }, [open])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    onOpenChange(false)
    setQuery('')
  }

  const renderResultGroup = (
    type: keyof typeof typeLabels,
    items: SearchResult[],
    startIndex: number
  ) => {
    if (items.length === 0) return null

    const Icon = typeIcons[type]

    return (
      <div key={type} className="mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
          <Icon className="h-3 w-3" />
          {typeLabels[type]}
        </h3>
        <ul className="space-y-1">
          {items.map((result, index) => {
            const globalIndex = startIndex + index
            const isSelected = globalIndex === selectedIndex

            return (
              <li
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={cn(
                  'flex flex-col px-3 py-2 rounded-md cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <span className="font-medium text-sm">{result.title}</span>
                {result.subtitle && (
                  <span className={cn(
                    'text-xs',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {result.subtitle}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  const allResults = getAllResults()
  let currentIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Αναζήτηση</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Αναζήτηση πολιτών, αιτημάτων, επικοινωνιών..."
            className="border-0 focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-4">
          {query.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Πληκτρολογήστε τουλάχιστον 2 χαρακτήρες για αναζήτηση
            </p>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Δεν βρέθηκαν αποτελέσματα για &quot;{query}&quot;
            </p>
          ) : (
            <>
              {results && (
                <>
                  {(() => {
                    const citizenStart = currentIndex
                    currentIndex += results.citizens.length
                    return renderResultGroup('citizen', results.citizens, citizenStart)
                  })()}
                  {(() => {
                    const requestStart = currentIndex
                    currentIndex += results.requests.length
                    return renderResultGroup('request', results.requests, requestStart)
                  })()}
                  {(() => {
                    const commStart = currentIndex
                    currentIndex += results.communications.length
                    return renderResultGroup('communication', results.communications, commStart)
                  })()}
                  {(() => {
                    const militaryStart = currentIndex
                    currentIndex += results.military.length
                    return renderResultGroup('military', results.military, militaryStart)
                  })()}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex justify-between">
          <span>
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">↑↓</kbd> για πλοήγηση
          </span>
          <span>
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</kbd> για επιλογή
          </span>
          <span>
            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">ESC</kbd> για κλείσιμο
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
