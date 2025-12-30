import { notFound } from 'next/navigation'
import { getRequest } from '@/lib/actions/requests'
import { RequestForm } from '@/components/requests/RequestForm'
import { getLabel, REQUEST_CATEGORY_OPTIONS } from '@/lib/utils/constants'

interface EditRequestPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRequestPage({ params }: EditRequestPageProps) {
  const { id } = await params
  const request = await getRequest(id)

  if (!request) {
    notFound()
  }

  const citizenName = request.citizen
    ? `${request.citizen.surname} ${request.citizen.first_name}`
    : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Επεξεργασία: {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
        </h1>
        <p className="text-muted-foreground">
          Ενημερώστε τα στοιχεία του αιτήματος
        </p>
      </div>

      <RequestForm
        mode="edit"
        request={request}
        citizenId={request.citizen_id}
        citizenName={citizenName}
      />
    </div>
  )
}
