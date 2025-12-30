import { notFound } from 'next/navigation'
import { getCitizen } from '@/lib/actions/citizens'
import { CitizenForm } from '@/components/citizens/CitizenForm'

interface EditCitizenPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCitizenPage({ params }: EditCitizenPageProps) {
  const { id } = await params
  const citizen = await getCitizen(id)

  if (!citizen) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Επεξεργασία: {citizen.surname} {citizen.first_name}
        </h1>
        <p className="text-muted-foreground">
          Ενημερώστε τα στοιχεία του πολίτη
        </p>
      </div>

      <CitizenForm mode="edit" citizen={citizen} />
    </div>
  )
}
