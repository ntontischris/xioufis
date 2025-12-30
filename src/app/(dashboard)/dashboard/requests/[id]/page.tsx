import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRequest } from '@/lib/actions/requests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RequestBadge } from '@/components/requests/RequestBadge'
import { DeleteRequestDialog } from '@/components/requests/DeleteRequestDialog'
import { StatusChangeButtons } from '@/components/requests/StatusChangeButtons'
import {
  LABELS,
  getLabel,
  REQUEST_CATEGORY_OPTIONS,
} from '@/lib/utils/constants'
import {
  ClipboardList,
  User,
  Calendar,
  FileText,
  Pencil,
  ArrowLeft,
  Trash2,
} from 'lucide-react'

interface RequestDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params
  const request = await getRequest(id)

  if (!request) {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('el-GR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/requests">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <RequestBadge status={request.status} />
              {request.citizen && (
                <span className="text-muted-foreground">
                  - {request.citizen.surname} {request.citizen.first_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/requests/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Επεξεργασία
            </Button>
          </Link>
          <DeleteRequestDialog
            requestId={request.id}
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
          {/* Request Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Στοιχεία Αιτήματος
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.category}</p>
                <p className="font-medium">
                  {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.status}</p>
                <RequestBadge status={request.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.submitted_at}</p>
                <p className="font-medium">{formatDate(request.submitted_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.completed_at}</p>
                <p className="font-medium">{formatDate(request.completed_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Request Text Card */}
          {request.request_text && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {LABELS.request_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.request_text}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes Card */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {LABELS.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Citizen Info */}
          {request.citizen && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Πολίτης
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ονοματεπώνυμο</p>
                  <Link
                    href={`/dashboard/citizens/${request.citizen.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {request.citizen.surname} {request.citizen.first_name}
                  </Link>
                </div>
                {request.citizen.mobile && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.mobile}</p>
                    <p className="font-medium">{request.citizen.mobile}</p>
                  </div>
                )}
                {request.citizen.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.email}</p>
                    <p className="font-medium">{request.citizen.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Status Change */}
          <Card>
            <CardHeader>
              <CardTitle>Αλλαγή Κατάστασης</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChangeButtons requestId={request.id} currentStatus={request.status} />
            </CardContent>
          </Card>

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
                <p className="font-medium">{formatDate(request.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.updated_at}</p>
                <p className="font-medium">{formatDate(request.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
