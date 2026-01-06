'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
import { RequestTable } from '@/components/requests/RequestTable'
import { useRequests } from '@/lib/hooks/useRequests'
import { REQUEST_STATUS_OPTIONS, REQUEST_CATEGORY_OPTIONS } from '@/lib/utils/constants'
import { Plus, Search, ClipboardList, User, ArrowLeft, X } from 'lucide-react'
import { ExportButton } from '@/components/ui/ExportButton'
import { requestsExportColumns } from '@/lib/utils/export-configs'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import { CollapsibleFilters } from '@/components/ui/CollapsibleFilters'

export default function RequestsPage() {
  return (
    <Suspense fallback={<RequestsPageSkeleton />}>
      <RequestsPageContent />
    </Suspense>
  )
}

function RequestsPageSkeleton() {
  return (
    <>
      <Header title="Αιτήματα" />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Λίστα Αιτημάτων
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} cols={6} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function RequestsPageContent() {
  const searchParams = useSearchParams()
  const citizenId = searchParams.get('citizen')

  const { requests, loading, error } = useRequests()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  // Check for success message from delete action
  useEffect(() => {
    const successMessage = sessionStorage.getItem('request_action_success')
    if (successMessage) {
      toast.success(successMessage)
      sessionStorage.removeItem('request_action_success')
    }
  }, [])

  // Get citizen name for display when filtering
  const citizenName = citizenId
    ? requests.find(r => r.citizen_id === citizenId)?.citizen
    : null

  const filteredRequests = requests.filter((request) => {
    // First filter by citizen if specified
    if (citizenId && request.citizen_id !== citizenId) {
      return false
    }

    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      request.citizen?.surname.toLowerCase().includes(searchLower) ||
      request.citizen?.first_name.toLowerCase().includes(searchLower) ||
      request.request_text?.toLowerCase().includes(searchLower)

    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesCategory = !categoryFilter || request.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage
  } = usePagination(filteredRequests, { itemsPerPage: 20 })

  const clearFilters = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setSearch('')
  }

  const hasFilters = !!(statusFilter || categoryFilter || search)
  const activeFilterCount = [statusFilter, categoryFilter].filter(Boolean).length

  return (
    <>
      <Header title={citizenName ? `Αιτήματα - ${citizenName.surname} ${citizenName.first_name}` : "Αιτήματα"} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Citizen filter banner */}
        {citizenId && citizenName && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 flex-1">
              <User className="h-5 w-5 text-indigo-600 shrink-0" />
              <p className="font-medium text-indigo-900 text-sm md:text-base">
                Αιτήματα: {citizenName.surname} {citizenName.first_name}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                <Link href={`/dashboard/citizens/${citizenId}`}>
                  <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Πίσω στον πολίτη</span>
                  <span className="sm:hidden">Πίσω</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="flex-1 sm:flex-initial">
                <Link href="/dashboard/requests">
                  <X className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Δείτε όλα</span>
                  <span className="sm:hidden">Όλα</span>
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <ExportButton
              data={filteredRequests}
              columns={requestsExportColumns}
              options={{ fileName: 'aithmata', sheetName: 'Αιτήματα' }}
            />
            <Button asChild className="flex-1 sm:flex-initial">
              <Link href={citizenId ? `/dashboard/requests/new?citizen=${citizenId}` : "/dashboard/requests/new"}>
                <Plus className="mr-2 h-4 w-4" />
                Νέο Αίτημα
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <CollapsibleFilters
          hasFilters={hasFilters}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        >
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Κατάσταση" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλες οι καταστάσεις</SelectItem>
              {REQUEST_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Κατηγορία" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλες οι κατηγορίες</SelectItem>
              {REQUEST_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleFilters>

        {/* Requests table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <ClipboardList className="h-5 w-5" />
              <span className="hidden sm:inline">Λίστα Αιτημάτων</span>
              <span className="sm:hidden">Αιτήματα</span>
              <Badge variant="secondary" className="ml-2">
                {filteredRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
            {loading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Σφάλμα: {error}</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Δεν βρέθηκαν αιτήματα</p>
                {hasFilters && (
                  <p className="text-sm mt-1">
                    Δοκιμάστε διαφορετικά φίλτρα
                  </p>
                )}
              </div>
            ) : (
              <>
                <RequestTable requests={paginatedItems} />
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
