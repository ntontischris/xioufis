import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCommunication } from '@/lib/actions/communications'
import { CommunicationForm } from '@/components/communications/CommunicationForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface EditCommunicationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCommunicationPage({ params }: EditCommunicationPageProps) {
  const { id } = await params
  const communication = await getCommunication(id)

  if (!communication) {
    notFound()
  }

  const citizenName = communication.citizen
    ? `${communication.citizen.surname} ${communication.citizen.first_name}`
    : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/communications/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Επεξεργασία Επικοινωνίας
          </h1>
          {citizenName && (
            <p className="text-muted-foreground">
              Πολίτης: {citizenName}
            </p>
          )}
        </div>
      </div>

      <CommunicationForm
        communication={communication}
        citizenName={citizenName}
        mode="edit"
      />
    </div>
  )
}
