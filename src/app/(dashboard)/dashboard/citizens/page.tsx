'use client'

import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCitizens } from '@/lib/hooks/useCitizens'
import { Plus, Search, Loader2, Users } from 'lucide-react'
import { useState } from 'react'
import { formatGreekPhone } from '@/lib/utils/validators'
import { getLabel, MUNICIPALITY_OPTIONS } from '@/lib/utils/constants'
import Link from 'next/link'

export default function CitizensPage() {
  const { citizens, loading, error } = useCitizens()
  const [search, setSearch] = useState('')

  const filteredCitizens = citizens.filter((citizen) => {
    const searchLower = search.toLowerCase()
    return (
      citizen.surname.toLowerCase().includes(searchLower) ||
      citizen.first_name.toLowerCase().includes(searchLower) ||
      citizen.mobile?.toLowerCase().includes(searchLower) ||
      citizen.email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      <Header title="Πολίτες" />
      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-4">
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
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
                {search && (
                  <p className="text-sm mt-1">
                    Δοκιμάστε διαφορετικούς όρους αναζήτησης
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ονοματεπώνυμο</TableHead>
                    <TableHead>Κινητό</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Δήμος</TableHead>
                    <TableHead className="text-right">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCitizens.map((citizen) => (
                    <TableRow key={citizen.id}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
