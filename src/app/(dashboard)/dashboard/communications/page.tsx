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
import { CommunicationTable } from '@/components/communications/CommunicationTable'
import { useCommunications } from '@/lib/hooks/useCommunications'
import { COMMUNICATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import { Plus, Search, MessageSquare, Filter, X } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'

export default function CommunicationsPage() {
  return (
    <Suspense fallback={<CommunicationsPageSkeleton />}>
      <CommunicationsPageContent />
    </Suspense>
  )
}

function CommunicationsPageSkeleton() {
  return (
    <>
      <Header title="Επικοινωνίες" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ιστορικό Επικοινωνιών
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} cols={5} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function CommunicationsPageContent() {
  const { communications, loading, error } = useCommunications()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Check for success message from delete action
  useEffect(() => {
    const successMessage = sessionStorage.getItem('communication_action_success')
    if (successMessage) {
      toast.success(successMessage)
      sessionStorage.removeItem('communication_action_success')
    }
  }, [])

  const filteredCommunications = communications.filter((comm) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      !search ||
      comm.citizen?.surname.toLowerCase().includes(searchLower) ||
      comm.citizen?.first_name.toLowerCase().includes(searchLower) ||
      comm.notes?.toLowerCase().includes(searchLower)

    const matchesType = !typeFilter || comm.comm_type === typeFilter

    return matchesSearch && matchesType
  })

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage
  } = usePagination(filteredCommunications, { itemsPerPage: 20 })

  const clearFilters = () => {
    setTypeFilter('')
    setSearch('')
  }

  const hasFilters = typeFilter || search

  return (
    <>
      <Header title="Επικοινωνίες" />
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
            <Link href="/dashboard/communications/new">
              <Plus className="mr-2 h-4 w-4" />
              Νέα Επικοινωνία
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Τύπος" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι τύποι</SelectItem>
              {COMMUNICATION_TYPE_OPTIONS.map((option) => (
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

        {/* Communications table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ιστορικό Επικοινωνιών
              <Badge variant="secondary" className="ml-2">
                {filteredCommunications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={10} cols={5} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Σφάλμα: {error}</p>
              </div>
            ) : filteredCommunications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Δεν βρέθηκαν επικοινωνίες</p>
                {hasFilters && (
                  <p className="text-sm mt-1">
                    Δοκιμάστε διαφορετικά φίλτρα
                  </p>
                )}
              </div>
            ) : (
              <>
                <CommunicationTable communications={paginatedItems} />
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
