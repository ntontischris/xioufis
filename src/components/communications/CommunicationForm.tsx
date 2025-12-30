'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { communicationSchema, type CommunicationFormData } from '@/lib/utils/validators'
import { createCommunication } from '@/lib/actions/communications'
import { LABELS, COMMUNICATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

interface CommunicationFormProps {
  citizenId: string
  citizenName?: string
  onSuccess?: () => void
}

export function CommunicationForm({ citizenId, citizenName, onSuccess }: CommunicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const defaultValues = {
    citizen_id: citizenId,
    communication_date: new Date().toISOString().split('T')[0],
    comm_type: '',
    notes: '',
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: defaultValues as CommunicationFormData,
  })

  const onSubmit = (data: CommunicationFormData) => {
    startTransition(async () => {
      try {
        const result = await createCommunication(data)

        if (result.success) {
          toast.success('Η επικοινωνία καταχωρήθηκε επιτυχώς!')
          if (onSuccess) {
            onSuccess()
          } else {
            router.push(`/dashboard/citizens/${citizenId}`)
          }
        } else {
          toast.error(result.error || 'Προέκυψε σφάλμα')
        }
      } catch {
        toast.error('Προέκυψε απροσδόκητο σφάλμα')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Στοιχεία Επικοινωνίας</CardTitle>
          {citizenName && (
            <p className="text-sm text-muted-foreground">
              Πολίτης: <span className="font-medium">{citizenName}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" {...register('citizen_id')} />

          <div className="space-y-2">
            <Label htmlFor="comm_type">
              {LABELS.comm_type} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('comm_type') || ''}
              onValueChange={(value) => setValue('comm_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε τύπο" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.comm_type && (
              <p className="text-sm text-red-500">{String(errors.comm_type.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication_date">
              {LABELS.communication_date} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="communication_date"
              type="date"
              {...register('communication_date')}
            />
            {errors.communication_date && (
              <p className="text-sm text-red-500">{String(errors.communication_date.message)}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">{LABELS.notes}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Σημειώσεις επικοινωνίας..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Πίσω
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Αποθήκευση...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Καταχώρηση
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
