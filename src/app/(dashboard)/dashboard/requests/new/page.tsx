'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { RequestForm } from '@/components/requests/RequestForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useCitizens } from '@/lib/hooks/useCitizens'
import { User, Loader2 } from 'lucide-react'

function NewRequestContent() {
  const searchParams = useSearchParams()
  const citizenIdParam = searchParams.get('citizen')

  const { citizens, loading: loadingCitizens } = useCitizens()
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(citizenIdParam || '')

  // Derive citizen name from selected ID and citizens array
  const selectedCitizenName = useMemo(() => {
    if (!selectedCitizenId) return ''
    const citizen = citizens.find((c) => c.id === selectedCitizenId)
    return citizen ? `${citizen.surname} ${citizen.first_name}` : ''
  }, [selectedCitizenId, citizens])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Νέο Αίτημα</h1>
        <p className="text-muted-foreground">
          Δημιουργήστε ένα νέο αίτημα για πολίτη
        </p>
      </div>

      {/* Citizen Selection */}
      {!citizenIdParam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Επιλογή Πολίτη
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>
                Πολίτης <span className="text-red-500">*</span>
              </Label>
              {loadingCitizens ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Φόρτωση πολιτών...
                </div>
              ) : (
                <Select
                  value={selectedCitizenId}
                  onValueChange={setSelectedCitizenId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε πολίτη" />
                  </SelectTrigger>
                  <SelectContent>
                    {citizens.map((citizen) => (
                      <SelectItem key={citizen.id} value={citizen.id}>
                        {citizen.surname} {citizen.first_name}
                        {citizen.father_name && ` (${citizen.father_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Form - only show when citizen is selected */}
      {selectedCitizenId ? (
        <RequestForm
          mode="create"
          citizenId={selectedCitizenId}
          citizenName={selectedCitizenName}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Επιλέξτε πρώτα έναν πολίτη για να συνεχίσετε</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <NewRequestContent />
    </Suspense>
  )
}
