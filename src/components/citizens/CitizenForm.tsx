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
import { citizenWithMilitarySchema, type CitizenWithMilitaryFormData } from '@/lib/utils/validators'
import { createCitizenWithMilitary, updateCitizen } from '@/lib/actions/citizens'
import {
  LABELS,
  MUNICIPALITY_OPTIONS,
  ELECTORAL_DISTRICT_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
  MILITARY_TYPE_OPTIONS,
  ESSO_LETTER_OPTIONS,
  REQUEST_CATEGORY_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
} from '@/lib/utils/constants'
import type { Citizen } from '@/types/database'
import { Loader2, Save, ArrowLeft, Shield, FileText, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface CitizenFormProps {
  citizen?: Citizen
  mode: 'create' | 'edit'
}

export function CitizenForm({ citizen, mode }: CitizenFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const currentYear = new Date().getFullYear()
  const essoYearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i - 1)

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
        // Military fields (empty for edit mode - military is edited separately)
        military_type: '',
        esso_year: undefined,
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
        military_notes: '',
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
        // Military fields
        military_type: '',
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
        military_notes: '',
        // Request fields
        add_request: false,
        request_category: '',
        request_status: 'PENDING',
        request_text: '',
        request_notes: '',
        request_submitted_at: new Date().toISOString().split('T')[0],
        // Communication fields
        add_communication: false,
        comm_type: '',
        communication_date: new Date().toISOString().split('T')[0],
        communication_notes: '',
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CitizenWithMilitaryFormData>({
    resolver: zodResolver(citizenWithMilitarySchema),
    defaultValues: defaultValues as CitizenWithMilitaryFormData,
  })

  const watchCategory = watch('contact_category')
  const watchMilitaryType = watch('military_type')
  const watchAddRequest = watch('add_request')
  const watchAddCommunication = watch('add_communication')
  const isMilitaryCategory = watchCategory === 'MILITARY'
  const isConscript = watchMilitaryType === 'CONSCRIPT'

  // Collapsible state for request and communication sections
  const [requestExpanded, setRequestExpanded] = useState(false)
  const [communicationExpanded, setCommunicationExpanded] = useState(false)

  const onSubmit = (data: CitizenWithMilitaryFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === 'create'
            ? await createCitizenWithMilitary(data)
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
              onValueChange={(value) => {
                setValue('contact_category', value, { shouldDirty: true })
                // Auto-set military_type when selecting MILITARY category
                if (value === 'MILITARY') {
                  setValue('military_type', 'CONSCRIPT', { shouldDirty: true })
                } else {
                  setValue('military_type', '', { shouldDirty: true })
                }
              }}
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
            {isMilitaryCategory
              ? 'Για στρατιωτικό απαιτείται κινητό ή email (όχι μόνο σταθερό)'
              : 'Απαιτείται τουλάχιστον ένα στοιχείο επικοινωνίας'
            }
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="mobile">
              {LABELS.mobile} {isMilitaryCategory && <span className="text-red-500">*</span>}
            </Label>
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
            <Label htmlFor="email">
              {LABELS.email} {isMilitaryCategory && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{String(errors.email.message)}</p>
            )}
            {isMilitaryCategory && (
              <p className="text-xs text-muted-foreground">* Απαιτείται κινητό ή email</p>
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

      {/* Optional Request Section - only in create mode */}
      {mode === 'create' && (
        <Card className={watchAddRequest ? 'border-blue-200 bg-blue-50/50' : ''}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => {
              setRequestExpanded(!requestExpanded)
              if (!requestExpanded && !watchAddRequest) {
                setValue('add_request', true)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="add_request"
                  checked={watchAddRequest || false}
                  onCheckedChange={(checked) => {
                    setValue('add_request', !!checked)
                    if (checked) setRequestExpanded(true)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Προσθήκη Αιτήματος
                </CardTitle>
              </div>
              {requestExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Προαιρετικά, προσθέστε ένα αίτημα για τον πολίτη
            </p>
          </CardHeader>
          {requestExpanded && (
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="request_category">
                  {LABELS.category} {watchAddRequest && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={watch('request_category') || ''}
                  onValueChange={(value) => setValue('request_category', value)}
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
                {errors.request_category && (
                  <p className="text-sm text-red-500">{String(errors.request_category.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="request_status">
                  {LABELS.status} {watchAddRequest && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={watch('request_status') || 'PENDING'}
                  onValueChange={(value) => setValue('request_status', value)}
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
                <Label htmlFor="request_submitted_at">{LABELS.submitted_at}</Label>
                <Input
                  id="request_submitted_at"
                  type="date"
                  {...register('request_submitted_at')}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="request_text">{LABELS.request_text}</Label>
                <Textarea
                  {...register('request_text')}
                  placeholder="Περιγραφή αιτήματος..."
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="request_notes">{LABELS.notes}</Label>
                <Textarea
                  {...register('request_notes')}
                  placeholder="Σημειώσεις αιτήματος..."
                  rows={2}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Optional Communication Section - only in create mode */}
      {mode === 'create' && (
        <Card className={watchAddCommunication ? 'border-green-200 bg-green-50/50' : ''}>
          <CardHeader
            className="cursor-pointer"
            onClick={() => {
              setCommunicationExpanded(!communicationExpanded)
              if (!communicationExpanded && !watchAddCommunication) {
                setValue('add_communication', true)
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="add_communication"
                  checked={watchAddCommunication || false}
                  onCheckedChange={(checked) => {
                    setValue('add_communication', !!checked)
                    if (checked) setCommunicationExpanded(true)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  Προσθήκη Επικοινωνίας
                </CardTitle>
              </div>
              {communicationExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Προαιρετικά, καταγράψτε μια επικοινωνία με τον πολίτη
            </p>
          </CardHeader>
          {communicationExpanded && (
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="comm_type">
                  {LABELS.comm_type} {watchAddCommunication && <span className="text-red-500">*</span>}
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
                  {LABELS.communication_date} {watchAddCommunication && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="communication_date"
                  type="date"
                  {...register('communication_date')}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="communication_notes">{LABELS.notes}</Label>
                <Textarea
                  {...register('communication_notes')}
                  placeholder="Σημειώσεις επικοινωνίας..."
                  rows={3}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Military Fields - shown when category is MILITARY */}
      {isMilitaryCategory && mode === 'create' && (
        <>
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-indigo-700">
                <Shield className="h-5 w-5" />
                Στοιχεία Στρατιωτικού
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="military_type">
                  {LABELS.military_type} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('military_type') || 'CONSCRIPT'}
                  onValueChange={(value) => setValue('military_type', value, { shouldValidate: true })}
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
              </div>
            </CardContent>
          </Card>

          {/* Conscript Fields */}
          {isConscript ? (
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg">Στοιχεία Στρατιώτη</CardTitle>
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
          ) : watchMilitaryType === 'PERMANENT' ? (
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg">Στοιχεία Μόνιμου</CardTitle>
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
          ) : null}

          {/* Military Notes */}
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg">Σημειώσεις Στρατιωτικού</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('military_notes')}
                placeholder="Σημειώσεις για το στρατιωτικό..."
                rows={3}
              />
            </CardContent>
          </Card>
        </>
      )}

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
