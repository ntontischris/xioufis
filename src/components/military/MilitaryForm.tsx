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
import { militarySchema, type MilitaryFormData } from '@/lib/utils/validators'
import { createMilitary, updateMilitary } from '@/lib/actions/military'
import {
  LABELS,
  MILITARY_TYPE_OPTIONS,
  ESSO_LETTER_OPTIONS,
} from '@/lib/utils/constants'
import type { MilitaryPersonnel } from '@/types/database'
import { Loader2, Save, ArrowLeft, Shield, User } from 'lucide-react'

interface MilitaryFormProps {
  military?: MilitaryPersonnel
  mode: 'create' | 'edit'
}

export function MilitaryForm({ military, mode }: MilitaryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const currentYear = new Date().getFullYear()
  const essoYearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i - 1)

  const defaultValues = military
    ? {
        citizen_id: military.citizen_id || '',
        military_type: military.military_type,
        surname: military.surname,
        first_name: military.first_name,
        father_name: military.father_name || '',
        mobile: military.mobile || '',
        email: military.email || '',
        esso_year: military.esso_year || null,
        esso_letter: military.esso_letter || '',
        military_number: military.military_number || '',
        conscript_wish: military.conscript_wish || '',
        training_center: military.training_center || '',
        presentation_date: military.presentation_date || '',
        assignment: military.assignment || '',
        assignment_date: military.assignment_date || '',
        transfer: military.transfer || '',
        transfer_date: military.transfer_date || '',
        rank: military.rank || '',
        service_unit: military.service_unit || '',
        permanent_wish: military.permanent_wish || '',
        service_number: military.service_number || '',
        notes: military.notes || '',
      }
    : {
        citizen_id: '',
        military_type: 'CONSCRIPT',
        surname: '',
        first_name: '',
        father_name: '',
        mobile: '',
        email: '',
        esso_year: currentYear,
        esso_letter: '',
        military_number: '',
        conscript_wish: '',
        training_center: '',
        presentation_date: '',
        assignment: '',
        assignment_date: '',
        transfer: '',
        transfer_date: '',
        rank: '',
        service_unit: '',
        permanent_wish: '',
        service_number: '',
        notes: '',
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MilitaryFormData>({
    resolver: zodResolver(militarySchema),
    defaultValues: defaultValues as MilitaryFormData,
  })

  const watchMilitaryType = watch('military_type')
  const isConscript = watchMilitaryType === 'CONSCRIPT'

  const onSubmit = (data: MilitaryFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === 'create'
            ? await createMilitary(data)
            : await updateMilitary(military!.id, data)

        if (result.success) {
          toast.success(
            mode === 'create'
              ? 'Το στρατιωτικό προσωπικό καταχωρήθηκε επιτυχώς!'
              : 'Το στρατιωτικό προσωπικό ενημερώθηκε επιτυχώς!'
          )
          if (mode === 'create' && result.data?.id) {
            router.push(`/dashboard/military/${result.data.id}`)
          } else if (mode === 'edit') {
            router.push(`/dashboard/military/${military!.id}`)
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
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Βασικά Στοιχεία
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="military_type">
              {LABELS.military_type} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('military_type') || 'CONSCRIPT'}
              onValueChange={(value) => setValue('military_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε τύπο" />
              </SelectTrigger>
              <SelectContent>
                {MILITARY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.military_type && (
              <p className="text-sm text-red-500">{String(errors.military_type.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname">
              {LABELS.surname} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="surname"
              {...register('surname')}
              placeholder="Επώνυμο"
            />
            {errors.surname && (
              <p className="text-sm text-red-500">{String(errors.surname.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_name">
              {LABELS.first_name} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="Όνομα"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{String(errors.first_name.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="father_name">{LABELS.father_name}</Label>
            <Input
              id="father_name"
              {...register('father_name')}
              placeholder="Πατρώνυμο"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">{LABELS.mobile}</Label>
            <Input
              id="mobile"
              type="tel"
              {...register('mobile')}
              placeholder="69xxxxxxxx"
            />
            {errors.mobile && (
              <p className="text-sm text-red-500">{String(errors.mobile.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{LABELS.email}</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{String(errors.email.message)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Fields based on military type */}
      {isConscript ? (
        // Conscript Fields
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Στοιχεία Στρατιώτη
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="esso_year">{LABELS.esso_year}</Label>
              <Select
                value={watch('esso_year')?.toString() || ''}
                onValueChange={(value) => setValue('esso_year', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε έτος" />
                </SelectTrigger>
                <SelectContent>
                  {essoYearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="esso_letter">{LABELS.esso_letter}</Label>
              <Select
                value={watch('esso_letter') || ''}
                onValueChange={(value) => setValue('esso_letter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε ΕΣΣΟ" />
                </SelectTrigger>
                <SelectContent>
                  {ESSO_LETTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="military_number">{LABELS.military_number}</Label>
              <Input
                id="military_number"
                {...register('military_number')}
                placeholder="ΑΣΜ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_center">{LABELS.training_center}</Label>
              <Input
                id="training_center"
                {...register('training_center')}
                placeholder="Κέντρο εκπαίδευσης"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation_date">{LABELS.presentation_date}</Label>
              <Input
                id="presentation_date"
                type="date"
                {...register('presentation_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conscript_wish">{LABELS.conscript_wish}</Label>
              <Input
                id="conscript_wish"
                {...register('conscript_wish')}
                placeholder="Επιθυμία τοποθέτησης"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment">{LABELS.assignment}</Label>
              <Input
                id="assignment"
                {...register('assignment')}
                placeholder="Τοποθέτηση"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_date">{LABELS.assignment_date}</Label>
              <Input
                id="assignment_date"
                type="date"
                {...register('assignment_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer">{LABELS.transfer}</Label>
              <Input
                id="transfer"
                {...register('transfer')}
                placeholder="Μετάθεση/Απόσπαση"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer_date">{LABELS.transfer_date}</Label>
              <Input
                id="transfer_date"
                type="date"
                {...register('transfer_date')}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        // Permanent Fields
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Στοιχεία Μόνιμου
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rank">{LABELS.rank}</Label>
              <Input
                id="rank"
                {...register('rank')}
                placeholder="Βαθμός"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_unit">{LABELS.service_unit}</Label>
              <Input
                id="service_unit"
                {...register('service_unit')}
                placeholder="Μονάδα"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_number">{LABELS.service_number}</Label>
              <Input
                id="service_number"
                {...register('service_number')}
                placeholder="ΑΜ"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="permanent_wish">{LABELS.permanent_wish}</Label>
              <Input
                id="permanent_wish"
                {...register('permanent_wish')}
                placeholder="Επιθυμία"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{LABELS.notes}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Σημειώσεις..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
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
