import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMilitary } from '@/lib/actions/military'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteMilitaryDialog } from '@/components/military/DeleteMilitaryDialog'
import {
  LABELS,
  getLabel,
  MILITARY_TYPE_OPTIONS,
  ESSO_LETTER_OPTIONS,
} from '@/lib/utils/constants'
import { formatGreekPhone } from '@/lib/utils/validators'
import {
  User,
  Phone,
  Shield,
  FileText,
  Calendar,
  Pencil,
  ArrowLeft,
  Trash2,
  MapPin,
} from 'lucide-react'

interface MilitaryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function MilitaryDetailPage({ params }: MilitaryDetailPageProps) {
  const { id } = await params
  const military = await getMilitary(id)

  if (!military) {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('el-GR')
  }

  const isConscript = military.military_type === 'CONSCRIPT'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/military">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {military.surname} {military.first_name}
              </h1>
              <Badge variant={isConscript ? 'secondary' : 'default'}>
                {getLabel(MILITARY_TYPE_OPTIONS, military.military_type)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {military.father_name ? `του ${military.father_name}` : ''}
              {isConscript && military.esso_year && military.esso_letter
                ? ` - ΕΣΣΟ ${military.esso_year}${military.esso_letter}`
                : !isConscript && military.rank
                ? ` - ${military.rank}`
                : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/military/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Επεξεργασία
            </Button>
          </Link>
          <DeleteMilitaryDialog
            militaryId={military.id}
            militaryName={`${military.surname} ${military.first_name}`}
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
                <p className="font-medium">{military.surname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.first_name}</p>
                <p className="font-medium">{military.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.father_name}</p>
                <p className="font-medium">{military.father_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.military_type}</p>
                <p className="font-medium">{getLabel(MILITARY_TYPE_OPTIONS, military.military_type)}</p>
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
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.mobile}</p>
                <p className="font-medium">{formatGreekPhone(military.mobile)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.email}</p>
                <p className="font-medium">
                  {military.email ? (
                    <a href={`mailto:${military.email}`} className="text-indigo-600 hover:underline">
                      {military.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Military Info Card - Conditional based on type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isConscript ? 'Στοιχεία Στρατιώτη' : 'Στοιχεία Μόνιμου'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isConscript ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">ΕΣΣΟ</p>
                    <p className="font-medium">
                      {military.esso_year && military.esso_letter
                        ? `${military.esso_year} ${getLabel(ESSO_LETTER_OPTIONS, military.esso_letter)}`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.military_number}</p>
                    <p className="font-medium">{military.military_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.training_center}</p>
                    <p className="font-medium">{military.training_center || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.presentation_date}</p>
                    <p className="font-medium">{formatDate(military.presentation_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.conscript_wish}</p>
                    <p className="font-medium">{military.conscript_wish || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.assignment}</p>
                    <p className="font-medium">{military.assignment || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.assignment_date}</p>
                    <p className="font-medium">{formatDate(military.assignment_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.transfer}</p>
                    <p className="font-medium">{military.transfer || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.transfer_date}</p>
                    <p className="font-medium">{formatDate(military.transfer_date)}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.rank}</p>
                    <p className="font-medium">{military.rank || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.service_unit}</p>
                    <p className="font-medium">{military.service_unit || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.service_number}</p>
                    <p className="font-medium">{military.service_number || '-'}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-sm text-muted-foreground">{LABELS.permanent_wish}</p>
                    <p className="font-medium">{military.permanent_wish || '-'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes Card */}
          {military.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {LABELS.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{military.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Citizen */}
          {military.citizen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Συνδεδεμένος Πολίτης
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ονοματεπώνυμο</p>
                  <Link
                    href={`/dashboard/citizens/${military.citizen.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {military.citizen.surname} {military.citizen.first_name}
                  </Link>
                </div>
                {military.citizen.mobile && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.mobile}</p>
                    <p className="font-medium">{military.citizen.mobile}</p>
                  </div>
                )}
                {military.citizen.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.address}</p>
                    <p className="font-medium">{military.citizen.address}</p>
                  </div>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/citizens/${military.citizen.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Προβολή Πολίτη
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

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
                <p className="font-medium">{formatDate(military.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.updated_at}</p>
                <p className="font-medium">{formatDate(military.updated_at)}</p>
              </div>
              {military.assigned_user && (
                <div>
                  <p className="text-sm text-muted-foreground">{LABELS.assigned_user}</p>
                  <p className="font-medium">{military.assigned_user.full_name || '-'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
