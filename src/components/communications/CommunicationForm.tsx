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
import { createCommunication, updateCommunication } from '@/lib/actions/communications'
import { LABELS, COMMUNICATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import type { Communication } from '@/types/database'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

interface CommunicationFormProps {
  communication?: Communication
  citizenId?: string
  citizenName?: string
  mode?: 'create' | 'edit'
  onSuccess?: () => void
}

export function CommunicationForm({ communication, citizenId, citizenName, mode = 'create', onSuccess }: CommunicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const effectiveCitizenId = communication?.citizen_id || citizenId || ''

  const defaultValues = communication
    ? {
        citizen_id: communication.citizen_id,
        communication_date: communication.communication_date,
        comm_type: communication.comm_type,
        notes: communication.notes || '',
      }
    : {
        citizen_id: effectiveCitizenId,
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
        const result = mode === 'edit' && communication
          ? await updateCommunication(communication.id, data)
          : await createCommunication(data)

        if (result.success) {
          toast.success(
            mode === 'edit'
              ? 'Η επικοινωνία ενημερώθηκε επιτυχώς!'
              : 'Η επικοινωνία καταχωρήθηκε επιτυχώς!'
          )
          if (onSuccess) {
            onSuccess()
          } else if (mode === 'edit' && communication) {
            router.push(`/dashboard/communications/${communication.id}`)
          } else {
            router.push(`/dashboard/citizens/${effectiveCitizenId}`)
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
              {mode === 'edit' ? 'Ενημέρωση' : 'Καταχώρηση'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
