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
import { requestSchema, type RequestFormData } from '@/lib/utils/validators'
import { createRequest, updateRequest } from '@/lib/actions/requests'
import {
  LABELS,
  REQUEST_CATEGORY_OPTIONS,
  REQUEST_STATUS_OPTIONS,
} from '@/lib/utils/constants'
import type { Request } from '@/types/database'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

interface RequestFormProps {
  request?: Request
  citizenId?: string
  citizenName?: string
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function RequestForm({ request, citizenId, citizenName, mode, onSuccess }: RequestFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const defaultValues = request
    ? {
        citizen_id: request.citizen_id,
        category: request.category,
        status: request.status,
        request_text: request.request_text || '',
        notes: request.notes || '',
        submitted_at: request.submitted_at,
        completed_at: request.completed_at || '',
      }
    : {
        citizen_id: citizenId || '',
        category: '',
        status: 'PENDING',
        request_text: '',
        notes: '',
        submitted_at: new Date().toISOString().split('T')[0],
        completed_at: '',
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: defaultValues as RequestFormData,
  })

  const watchStatus = watch('status')

  const onSubmit = (data: RequestFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === 'create'
            ? await createRequest(data)
            : await updateRequest(request!.id, data)

        if (result.success) {
          toast.success(
            mode === 'create'
              ? 'Το αίτημα δημιουργήθηκε επιτυχώς!'
              : 'Το αίτημα ενημερώθηκε επιτυχώς!'
          )
          if (onSuccess) {
            onSuccess()
          } else if (mode === 'create' && result.data?.id) {
            router.push(`/dashboard/requests/${result.data.id}`)
          } else if (mode === 'edit') {
            router.push(`/dashboard/requests/${request!.id}`)
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
          <CardTitle className="text-lg">Στοιχεία Αιτήματος</CardTitle>
          {citizenName && (
            <p className="text-sm text-muted-foreground">
              Πολίτης: <span className="font-medium">{citizenName}</span>
            </p>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" {...register('citizen_id')} />

          <div className="space-y-2">
            <Label htmlFor="category">
              {LABELS.category} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('category') || ''}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{String(errors.category.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{LABELS.status}</Label>
            <Select
              value={watchStatus || 'PENDING'}
              onValueChange={(value) => {
                setValue('status', value)
                // Auto-set completion date when status is COMPLETED
                if (value === 'COMPLETED' && !watch('completed_at')) {
                  setValue('completed_at', new Date().toISOString().split('T')[0])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε κατάσταση" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitted_at">{LABELS.submitted_at}</Label>
            <Input
              id="submitted_at"
              type="date"
              {...register('submitted_at')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completed_at">{LABELS.completed_at}</Label>
            <Input
              id="completed_at"
              type="date"
              {...register('completed_at')}
              disabled={watchStatus !== 'COMPLETED'}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="request_text">{LABELS.request_text}</Label>
            <Textarea
              id="request_text"
              {...register('request_text')}
              placeholder="Περιγραφή του αιτήματος..."
              rows={3}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">{LABELS.notes}</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Σημειώσεις..."
              rows={3}
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
              {mode === 'create' ? 'Δημιουργία' : 'Αποθήκευση'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
