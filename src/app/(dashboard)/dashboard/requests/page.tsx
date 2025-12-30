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
import { RequestTable } from '@/components/requests/RequestTable'
import { useRequests } from '@/lib/hooks/useRequests'
import { REQUEST_STATUS_OPTIONS, REQUEST_CATEGORY_OPTIONS } from '@/lib/utils/constants'
import { Plus, Search, ClipboardList, Filter, X } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'

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
      <div className="p-6 space-y-6">
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

  const filteredRequests = requests.filter((request) => {
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

  const hasFilters = statusFilter || categoryFilter || search

  return (
    <>
      <Header title="Αιτήματα" />
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
            <Link href="/dashboard/requests/new">
              <Plus className="mr-2 h-4 w-4" />
              Νέο Αίτημα
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
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
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Καθαρισμός
            </Button>
          )}
        </div>

        {/* Requests table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Λίστα Αιτημάτων
              <Badge variant="secondary" className="ml-2">
                {filteredRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
