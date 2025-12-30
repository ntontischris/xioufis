import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCommunication } from '@/lib/actions/communications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteCommunicationDialog } from '@/components/communications/DeleteCommunicationDialog'
import {
  LABELS,
  getLabel,
  COMMUNICATION_TYPE_OPTIONS,
} from '@/lib/utils/constants'
import {
  MessageSquare,
  User,
  Calendar,
  FileText,
  Pencil,
  ArrowLeft,
  Trash2,
  Phone,
  Mail,
  Users,
} from 'lucide-react'

interface CommunicationDetailPageProps {
  params: Promise<{ id: string }>
}

const typeIcons: Record<string, React.ReactNode> = {
  PHONE: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  IN_PERSON: <Users className="h-4 w-4" />,
  SMS: <MessageSquare className="h-4 w-4" />,
  OTHER: <MessageSquare className="h-4 w-4" />,
}

export default async function CommunicationDetailPage({ params }: CommunicationDetailPageProps) {
  const { id } = await params
  const communication = await getCommunication(id)

  if (!communication) {
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
          <Link href="/dashboard/communications">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 text-lg px-3 py-1">
                {typeIcons[communication.comm_type] || typeIcons.OTHER}
                {getLabel(COMMUNICATION_TYPE_OPTIONS, communication.comm_type)}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">
                {formatDate(communication.communication_date)}
              </span>
              {communication.citizen && (
                <span className="text-muted-foreground">
                  - {communication.citizen.surname} {communication.citizen.first_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/communications/${id}/edit`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Επεξεργασία
            </Button>
          </Link>
          <DeleteCommunicationDialog
            communicationId={communication.id}
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
          {/* Communication Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Στοιχεία Επικοινωνίας
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.comm_type}</p>
                <Badge variant="outline" className="flex items-center gap-1 w-fit mt-1">
                  {typeIcons[communication.comm_type] || typeIcons.OTHER}
                  {getLabel(COMMUNICATION_TYPE_OPTIONS, communication.comm_type)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{LABELS.communication_date}</p>
                <p className="font-medium">{formatDate(communication.communication_date)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {LABELS.notes}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">
                {communication.notes || 'Χωρίς σημειώσεις'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Citizen Info */}
          {communication.citizen && (
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
                    href={`/dashboard/citizens/${communication.citizen.id}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {communication.citizen.surname} {communication.citizen.first_name}
                  </Link>
                </div>
                {communication.citizen.mobile && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.mobile}</p>
                    <p className="font-medium">{communication.citizen.mobile}</p>
                  </div>
                )}
                {communication.citizen.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">{LABELS.email}</p>
                    <p className="font-medium">{communication.citizen.email}</p>
                  </div>
                )}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/dashboard/citizens/${communication.citizen.id}`}>
                      Προβολή Πολίτη
                    </Link>
                  </Button>
                </div>
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
                <p className="font-medium">{formatDate(communication.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
