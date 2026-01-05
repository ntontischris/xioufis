'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MilitaryTable } from '@/components/military/MilitaryTable'
import { useMilitary } from '@/lib/hooks/useMilitary'
import { MILITARY_TYPE_OPTIONS, ESSO_LETTER_OPTIONS } from '@/lib/utils/constants'
import { Plus, Search, Shield, Filter, X, ClipboardList } from 'lucide-react'
import { normalizeForSearch } from '@/lib/utils'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'

export default function MilitaryPage() {
  return (
    <Suspense fallback={<MilitaryPageSkeleton />}>
      <MilitaryPageContent />
    </Suspense>
  )
}

function MilitaryPageSkeleton() {
  return (
    <>
      <Header title="Στρατιωτικό Προσωπικό" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Λίστα Στρατιωτικού Προσωπικού
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} cols={7} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Request status filter options
const REQUEST_STATUS_FILTER_OPTIONS = [
  { value: 'HAS_PENDING', label: 'Με εκκρεμή αιτήματα' },
  { value: 'ALL_COMPLETED', label: 'Όλα ολοκληρωμένα' },
  { value: 'HAS_REQUESTS', label: 'Με αιτήματα' },
  { value: 'NO_REQUESTS', label: 'Χωρίς αιτήματα' },
] as const

function MilitaryPageContent() {
  const { military, loading, error } = useMilitary()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [essoFilter, setEssoFilter] = useState<string>('')
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('')

  const currentYear = new Date().getFullYear()
  const essoYearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i - 1)

  // Check for success message from delete action
  useEffect(() => {
    const successMessage = sessionStorage.getItem('military_action_success')
    if (successMessage) {
      toast.success(successMessage)
      sessionStorage.removeItem('military_action_success')
    }
  }, [])

  const filteredMilitary = military.filter((m) => {
    // Accent-insensitive search
    const normalizedSearch = normalizeForSearch(search)
    const matchesSearch =
      !search ||
      normalizeForSearch(m.surname).includes(normalizedSearch) ||
      normalizeForSearch(m.first_name).includes(normalizedSearch) ||
      normalizeForSearch(m.mobile || '').includes(normalizedSearch)

    const matchesType = !typeFilter || m.military_type === typeFilter

    // ESSO filter format: "2024Α" or just "2024"
    let matchesEsso = true
    if (essoFilter && m.military_type === 'CONSCRIPT') {
      const essoYear = m.esso_year?.toString() || ''
      const essoLetter = m.esso_letter || ''
      const essoFull = `${essoYear}${essoLetter}`
      matchesEsso = essoFull.startsWith(essoFilter)
    } else if (essoFilter && m.military_type !== 'CONSCRIPT') {
      matchesEsso = false
    }

    // Request status filter
    let matchesRequestStatus = true
    if (requestStatusFilter === 'HAS_PENDING') {
      matchesRequestStatus = m.requests_pending > 0
    } else if (requestStatusFilter === 'ALL_COMPLETED') {
      matchesRequestStatus = m.requests_total > 0 && m.requests_pending === 0 && m.requests_not_completed === 0
    } else if (requestStatusFilter === 'HAS_REQUESTS') {
      matchesRequestStatus = m.requests_total > 0
    } else if (requestStatusFilter === 'NO_REQUESTS') {
      matchesRequestStatus = m.requests_total === 0
    }

    return matchesSearch && matchesType && matchesEsso && matchesRequestStatus
  })

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage
  } = usePagination(filteredMilitary, { itemsPerPage: 20 })

  const clearFilters = () => {
    setTypeFilter('')
    setEssoFilter('')
    setSearch('')
    setRequestStatusFilter('')
  }

  const hasFilters = typeFilter || essoFilter || search || requestStatusFilter

  return (
    <>
      <Header title="Στρατιωτικό Προσωπικό" />
      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Αναζήτηση..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button asChild>
            <Link href="/dashboard/military/new">
              <Plus className="mr-2 h-4 w-4" />
              Νέα Εγγραφή
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Τύπος" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι τύποι</SelectItem>
              {MILITARY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={essoFilter} onValueChange={(val) => setEssoFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="ΕΣΣΟ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλα τα ΕΣΣΟ</SelectItem>
              {essoYearOptions.map((year) =>
                ESSO_LETTER_OPTIONS.map((letter) => (
                  <SelectItem key={`${year}${letter.value}`} value={`${year}${letter.value}`}>
                    {year}{letter.value}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select value={requestStatusFilter} onValueChange={(val) => setRequestStatusFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Κατάσταση Αιτημάτων" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
              {REQUEST_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Καθαρισμός
            </Button>
          )}
        </div>

        {/* Military table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Λίστα Στρατιωτικού Προσωπικού
              <Badge variant="secondary" className="ml-2">
                {filteredMilitary.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={10} cols={7} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Σφάλμα: {error}</p>
              </div>
            ) : filteredMilitary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Δεν βρέθηκαν εγγραφές</p>
                {hasFilters && (
                  <p className="text-sm mt-1">
                    Δοκιμάστε διαφορετικά φίλτρα
                  </p>
                )}
              </div>
            ) : (
              <>
                <MilitaryTable military={paginatedItems} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
