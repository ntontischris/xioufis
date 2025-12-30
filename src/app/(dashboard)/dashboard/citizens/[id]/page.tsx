import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCitizen } from '@/lib/actions/citizens'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/citizens/DeleteDialog'
import {
  LABELS,
  getLabel,
  MUNICIPALITY_OPTIONS,
  ELECTORAL_DISTRICT_OPTIONS,
  CONTACT_CATEGORY_OPTIONS,
  REQUEST_CATEGORY_OPTIONS,
  COMMUNICATION_TYPE_OPTIONS,
} from '@/lib/utils/constants'
import { formatGreekPhone } from '@/lib/utils/validators'
import {
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Pencil,
  ArrowLeft,
  MessageSquare,
  ClipboardList,
  Trash2,
  Plus,
} from 'lucide-react'

// Type for citizen with relations from getCitizen
interface CitizenWithRelations {
  id: string
  surname: string
  first_name: string
  father_name: string | null
  referral_source: string | null
  mobile: string | null
  landline: string | null
  email: string | null
  address: string | null
  postal_code: string | null
  area: string | null
  municipality: string | null
  electoral_district: string | null
  contact_category: string
  profession: string | null
  notes: string | null
  is_active: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
  assigned_user?: { id: string; full_name: string | null } | null
  requests?: Array<{ id: string; category: string; submitted_at: string }>
  communications?: Array<{ id: string; comm_type: string; communication_date: string }>
}

interface CitizenDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CitizenDetailPage({ params }: CitizenDetailPageProps) {
  const { id } = await params
  const rawCitizen = await getCitizen(id)

  if (!rawCitizen) {
    notFound()
  }

  // Cast to our expected type
  const citizen = rawCitizen as unknown as CitizenWithRelations

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('el-GR')
  }

  const requests = Array.isArray(citizen.requests) ? citizen.requests : []
  const communications = Array.isArray(citizen.communications) ? citizen.communications : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/citizens">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {citizen.surname} {citizen.first_name}
            </h1>
            <p className="text-muted-foreground">
              {citizen.father_name ? `του ${citizen.father_name}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/citizens/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Επεξεργασία
            </Button>
          </Link>
          <DeleteDialog
            citizenId={citizen.id}
            citizenName={`${citizen.surname} ${citizen.first_name}`}
            variant="delete"
            trigger={
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Βασικά Στοιχεία
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.surname}</p>
                <p className="font-medium">{citizen.surname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.first_name}</p>
                <p className="font-medium">{citizen.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.father_name}</p>
                <p className="font-medium">{citizen.father_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.profession}</p>
                <p className="font-medium">{citizen.profession || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.referral_source}</p>
                <p className="font-medium">{citizen.referral_source || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.contact_category}</p>
                <p className="font-medium">
                  {getLabel(CONTACT_CATEGORY_OPTIONS, citizen.contact_category)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Στοιχεία Επικοινωνίας
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.mobile}</p>
                <p className="font-medium">{formatGreekPhone(citizen.mobile)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.landline}</p>
                <p className="font-medium">{formatGreekPhone(citizen.landline)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.email}</p>
                <p className="font-medium">
                  {citizen.email ? (
                    <a
                      href={`mailto:${citizen.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {citizen.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Διεύθυνση
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">{LABELS.address}</p>
                <p className="font-medium">{citizen.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.postal_code}</p>
                <p className="font-medium">{citizen.postal_code || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.area}</p>
                <p className="font-medium">{citizen.area || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.municipality}</p>
                <p className="font-medium">
                  {getLabel(MUNICIPALITY_OPTIONS, citizen.municipality)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.electoral_district}</p>
                <p className="font-medium">
                  {getLabel(ELECTORAL_DISTRICT_OPTIONS, citizen.electoral_district)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          {citizen.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {LABELS.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{citizen.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Πληροφορίες
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.created_at}</p>
                <p className="font-medium">{formatDate(citizen.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.updated_at}</p>
                <p className="font-medium">{formatDate(citizen.updated_at)}</p>
              </div>
              {citizen.assigned_user && (
                <div>
                  <p className="text-sm text-muted-foreground">{LABELS.assigned_user}</p>
                  <p className="font-medium">{citizen.assigned_user.full_name || '-'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Γρήγορες Ενέργειες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/dashboard/requests/new?citizen=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Νέο Αίτημα
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="secondary" asChild>
                <Link href={`/dashboard/communications/new?citizen=${id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Νέα Επικοινωνία
                </Link>
              </Button>
              <hr className="my-2" />
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/requests?citizen=${id}`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Αιτήματα ({requests.length})
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/communications?citizen=${id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Επικοινωνίες ({communications.length})
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          {requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Πρόσφατα Αιτήματα
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.slice(0, 3).map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="block border-b pb-2 last:border-0 hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <p className="font-medium text-sm">
                      {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(request.submitted_at)}
                    </p>
                  </Link>
                ))}
                {requests.length > 3 && (
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={`/dashboard/requests?citizen=${id}`}>
                      Δείτε όλα ({requests.length})
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Communications */}
          {communications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Πρόσφατες Επικοινωνίες
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communications.slice(0, 3).map((comm) => (
                  <div
                    key={comm.id}
                    className="block border-b pb-2 last:border-0 -mx-2 px-2 py-1"
                  >
                    <p className="font-medium text-sm">
                      {getLabel(COMMUNICATION_TYPE_OPTIONS, comm.comm_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comm.communication_date)}
                    </p>
                  </div>
                ))}
                {communications.length > 3 && (
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={`/dashboard/communications?citizen=${id}`}>
                      Δείτε όλες ({communications.length})
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
