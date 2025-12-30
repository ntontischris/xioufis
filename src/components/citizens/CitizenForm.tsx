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
import { citizenSchema, type CitizenFormData } from '@/lib/utils/validators'
import { createCitizen, updateCitizen } from '@/lib/actions/citizens'
import {
  LABELS,
  MUNICIPALITY_OPTIONS,
  ELECTORAL_DISTRICT_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
} from '@/lib/utils/constants'
import type { Citizen } from '@/types/database'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

interface CitizenFormProps {
  citizen?: Citizen
  mode: 'create' | 'edit'
}

export function CitizenForm({ citizen, mode }: CitizenFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const defaultValues = citizen
    ? {
        surname: citizen.surname,
        first_name: citizen.first_name,
        father_name: citizen.father_name || '',
        referral_source: citizen.referral_source || '',
        mobile: citizen.mobile || '',
        landline: citizen.landline || '',
        email: citizen.email || '',
        address: citizen.address || '',
        postal_code: citizen.postal_code || '',
        area: citizen.area || '',
        municipality: citizen.municipality || '',
        electoral_district: citizen.electoral_district || '',
        contact_category: citizen.contact_category || 'GDPR',
        profession: citizen.profession || '',
        notes: citizen.notes || '',
      }
    : {
        surname: '',
        first_name: '',
        father_name: '',
        referral_source: '',
        mobile: '',
        landline: '',
        email: '',
        address: '',
        postal_code: '',
        area: '',
        municipality: '',
        electoral_district: '',
        contact_category: 'GDPR',
        profession: '',
        notes: '',
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CitizenFormData>({
    resolver: zodResolver(citizenSchema),
    defaultValues: defaultValues as CitizenFormData,
  })

  const onSubmit = (data: CitizenFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === 'create'
            ? await createCitizen(data)
            : await updateCitizen(citizen!.id, data)

        if (result.success) {
          toast.success(
            mode === 'create'
              ? 'Ο πολίτης δημιουργήθηκε επιτυχώς!'
              : 'Ο πολίτης ενημερώθηκε επιτυχώς!'
          )
          if (mode === 'create' && result.data?.id) {
            router.push(`/dashboard/citizens/${result.data.id}`)
          } else if (mode === 'edit') {
            router.push(`/dashboard/citizens/${citizen!.id}`)
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
          <CardTitle className="text-lg">Βασικά Στοιχεία</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="surname">
              {LABELS.surname} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="surname"
              {...register('surname')}
              placeholder="Εισάγετε επίθετο"
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
              placeholder="Εισάγετε όνομα"
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
              placeholder="Εισάγετε πατρώνυμο"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">{LABELS.profession}</Label>
            <Input
              id="profession"
              {...register('profession')}
              placeholder="Εισάγετε ιδιότητα"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral_source">{LABELS.referral_source}</Label>
            <Input
              id="referral_source"
              {...register('referral_source')}
              placeholder="Πώς ήρθε σε επαφή"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_category">{LABELS.contact_category}</Label>
            <Select
              value={watch('contact_category') || 'GDPR'}
              onValueChange={(value) => setValue('contact_category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Στοιχεία Επικοινωνίας</CardTitle>
          <p className="text-sm text-muted-foreground">
            Απαιτείται τουλάχιστον ένα στοιχείο επικοινωνίας
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <Label htmlFor="landline">{LABELS.landline}</Label>
            <Input
              id="landline"
              type="tel"
              {...register('landline')}
              placeholder="2310xxxxxx"
            />
            {errors.landline && (
              <p className="text-sm text-red-500">{String(errors.landline.message)}</p>
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

      {/* Address Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Διεύθυνση</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">{LABELS.address}</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Οδός, Αριθμός"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">{LABELS.postal_code}</Label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              placeholder="54xxx"
              maxLength={5}
            />
            {errors.postal_code && (
              <p className="text-sm text-red-500">{String(errors.postal_code.message)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">{LABELS.area}</Label>
            <Input
              id="area"
              {...register('area')}
              placeholder="Περιοχή/Συνοικία"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipality">{LABELS.municipality}</Label>
            <Select
              value={watch('municipality') || ''}
              onValueChange={(value) => setValue('municipality', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε δήμο" />
              </SelectTrigger>
              <SelectContent>
                {MUNICIPALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="electoral_district">{LABELS.electoral_district}</Label>
            <Select
              value={watch('electoral_district') || ''}
              onValueChange={(value) => setValue('electoral_district', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε εκλ. περιφέρεια" />
              </SelectTrigger>
              <SelectContent>
                {ELECTORAL_DISTRICT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{LABELS.notes}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Προσθέστε σημειώσεις..."
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
