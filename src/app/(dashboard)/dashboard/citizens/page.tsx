'use client'

import { Suspense } from 'react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCitizens } from '@/lib/hooks/useCitizens'
import { Plus, Search, Users, Filter, X, ClipboardList } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { Pagination } from '@/components/ui/pagination'
import { usePagination } from '@/lib/hooks/usePagination'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatGreekPhone } from '@/lib/utils/validators'
import { normalizeForSearch } from '@/lib/utils'
import { getLabel, MUNICIPALITY_OPTIONS, ELECTORAL_DISTRICT_OPTIONS } from '@/lib/utils/constants'
import Link from 'next/link'

export default function CitizensPage() {
  return (
    <Suspense fallback={<CitizensPageSkeleton />}>
      <CitizensPageContent />
    </Suspense>
  )
}

function CitizensPageSkeleton() {
  return (
    <>
      <Header title="Πολίτες" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Λίστα Πολιτών
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

// Request status filter options
const REQUEST_STATUS_FILTER_OPTIONS = [
  { value: 'HAS_PENDING', label: 'Με εκκρεμή αιτήματα' },
  { value: 'ALL_COMPLETED', label: 'Όλα ολοκληρωμένα' },
  { value: 'HAS_REQUESTS', label: 'Με αιτήματα' },
  { value: 'NO_REQUESTS', label: 'Χωρίς αιτήματα' },
] as const

function CitizensPageContent() {
  const router = useRouter()
  const { citizens, loading, error } = useCitizens()
  const [search, setSearch] = useState('')
  const [firstNameFilter, setFirstNameFilter] = useState<string>('')
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('')
  const [districtFilter, setDistrictFilter] = useState<string>('')
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('')

  // Get unique first names for suggestions
  const uniqueFirstNames = [...new Set(citizens.map(c => c.first_name))].sort()

  const handleRowClick = (citizenId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/dashboard/citizens/${citizenId}`)
  }

  // Check for success message from delete/archive action
  useEffect(() => {
    const successMessage = sessionStorage.getItem('citizen_action_success')
    if (successMessage) {
      toast.success(successMessage)
      sessionStorage.removeItem('citizen_action_success')
    }
  }, [])

  const filteredCitizens = citizens.filter((citizen) => {
    // Accent-insensitive search using normalizeForSearch
    const normalizedSearch = normalizeForSearch(search)
    const matchesSearch = !search || (
      normalizeForSearch(citizen.surname).includes(normalizedSearch) ||
      normalizeForSearch(citizen.first_name).includes(normalizedSearch) ||
      normalizeForSearch(citizen.mobile || '').includes(normalizedSearch) ||
      normalizeForSearch(citizen.email || '').includes(normalizedSearch)
    )
    // First name filter - accent-insensitive
    const matchesFirstName = !firstNameFilter ||
      normalizeForSearch(citizen.first_name).startsWith(normalizeForSearch(firstNameFilter))
    const matchesMunicipality = !municipalityFilter || citizen.municipality === municipalityFilter
    const matchesDistrict = !districtFilter || citizen.electoral_district === districtFilter

    // Request status filter
    let matchesRequestStatus = true
    if (requestStatusFilter === 'HAS_PENDING') {
      matchesRequestStatus = citizen.requests_pending > 0
    } else if (requestStatusFilter === 'ALL_COMPLETED') {
      matchesRequestStatus = citizen.requests_total > 0 && citizen.requests_pending === 0 && citizen.requests_not_completed === 0
    } else if (requestStatusFilter === 'HAS_REQUESTS') {
      matchesRequestStatus = citizen.requests_total > 0
    } else if (requestStatusFilter === 'NO_REQUESTS') {
      matchesRequestStatus = citizen.requests_total === 0
    }

    return matchesSearch && matchesFirstName && matchesMunicipality && matchesDistrict && matchesRequestStatus
  })

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage
  } = usePagination(filteredCitizens, { itemsPerPage: 20 })

  const clearFilters = () => {
    setSearch('')
    setFirstNameFilter('')
    setMunicipalityFilter('')
    setDistrictFilter('')
    setRequestStatusFilter('')
  }

  const hasFilters = search || firstNameFilter || municipalityFilter || districtFilter || requestStatusFilter

  return (
    <>
      <Header title="Πολίτες" />
      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση πολίτη..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/citizens/new">
              <Plus className="mr-2 h-4 w-4" />
              Νέος Πολίτης
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* First Name Filter - for name days! */}
          <div className="relative">
            <Input
              list="first-names-list"
              placeholder="Φίλτρο ονόματος..."
              value={firstNameFilter}
              onChange={(e) => setFirstNameFilter(e.target.value)}
              className="w-[180px]"
            />
            <datalist id="first-names-list">
              {uniqueFirstNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <Select value={municipalityFilter} onValueChange={(val) => setMunicipalityFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Δήμος" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι δήμοι</SelectItem>
              {MUNICIPALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={districtFilter} onValueChange={(val) => setDistrictFilter(val === 'all' ? '' : val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Εκλ. Περιφέρεια" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλες οι περιφέρειες</SelectItem>
              {ELECTORAL_DISTRICT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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

        {/* Citizens table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Λίστα Πολιτών
              <Badge variant="secondary" className="ml-2">
                {filteredCitizens.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Σφάλμα: {error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Βεβαιωθείτε ότι έχετε συνδέσει τη Supabase
                </p>
              </div>
            ) : filteredCitizens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Δεν βρέθηκαν πολίτες</p>
                {hasFilters && (
                  <p className="text-sm mt-1">
                    Δοκιμάστε διαφορετικά φίλτρα
                  </p>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ονοματεπώνυμο</TableHead>
                      <TableHead>Κινητό</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Δήμος</TableHead>
                      <TableHead>Αιτήματα</TableHead>
                      <TableHead className="text-right">Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((citizen) => (
                      <TableRow
                        key={citizen.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(e) => handleRowClick(citizen.id, e)}
                      >
                        <TableCell className="font-medium">
                          {citizen.surname} {citizen.first_name}
                          {citizen.father_name && (
                            <span className="text-muted-foreground ml-1">
                              ({citizen.father_name})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatGreekPhone(citizen.mobile)}</TableCell>
                        <TableCell>{citizen.email || '-'}</TableCell>
                        <TableCell>
                          {getLabel(MUNICIPALITY_OPTIONS, citizen.municipality)}
                        </TableCell>
                        <TableCell>
                          {citizen.requests_total > 0 ? (
                            <Link
                              href={`/dashboard/requests?citizen=${citizen.id}`}
                              className="flex items-center gap-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ClipboardList className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {citizen.requests_pending > 0 && (
                                  <Badge variant="destructive" className="mr-1 text-xs">
                                    {citizen.requests_pending} εκκρεμή
                                  </Badge>
                                )}
                                {citizen.requests_completed > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    {citizen.requests_completed} ολοκλ.
                                  </Badge>
                                )}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/citizens/${citizen.id}`}>
                              Προβολή
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
