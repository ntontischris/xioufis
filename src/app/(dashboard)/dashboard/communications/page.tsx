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
import { CommunicationTable } from '@/components/communications/CommunicationTable'
import { useCommunications } from '@/lib/hooks/useCommunications'
import { COMMUNICATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import { Plus, Search, MessageSquare, User, ArrowLeft, X } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import { CollapsibleFilters } from '@/components/ui/CollapsibleFilters'

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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
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
  const searchParams = useSearchParams()
  const citizenId = searchParams.get('citizen')

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

  // Get citizen name for display when filtering
  const citizenName = citizenId
    ? communications.find(c => c.citizen_id === citizenId)?.citizen
    : null

  const filteredCommunications = communications.filter((comm) => {
    // First filter by citizen if specified
    if (citizenId && comm.citizen_id !== citizenId) {
      return false
    }

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

  const hasFilters = !!(typeFilter || search)
  const activeFilterCount = typeFilter ? 1 : 0

  return (
    <>
      <Header title={citizenName ? `Επικοινωνίες - ${citizenName.surname} ${citizenName.first_name}` : "Επικοινωνίες"} />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Citizen filter banner */}
        {citizenId && citizenName && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 flex-1">
              <User className="h-5 w-5 text-green-600 shrink-0" />
              <p className="font-medium text-green-900 text-sm md:text-base">
                Επικοινωνίες: {citizenName.surname} {citizenName.first_name}
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
                <Link href="/dashboard/communications">
                  <X className="mr-1 md:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Δείτε όλες</span>
                  <span className="sm:hidden">Όλες</span>
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
          <Button asChild className="w-full sm:w-auto">
            <Link href={citizenId ? `/dashboard/communications/new?citizen=${citizenId}` : "/dashboard/communications/new"}>
              <Plus className="mr-2 h-4 w-4" />
              Νέα Επικοινωνία
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <CollapsibleFilters
          hasFilters={hasFilters}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
        >
          <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-full md:w-[180px]">
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
        </CollapsibleFilters>

        {/* Communications table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <MessageSquare className="h-5 w-5" />
              <span className="hidden sm:inline">Ιστορικό Επικοινωνιών</span>
              <span className="sm:hidden">Επικοινωνίες</span>
              <Badge variant="secondary" className="ml-2">
                {filteredCommunications.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
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
