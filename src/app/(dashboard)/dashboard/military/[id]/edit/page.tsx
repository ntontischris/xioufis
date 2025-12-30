import { notFound } from 'next/navigation'
import { getMilitary } from '@/lib/actions/military'
import { MilitaryForm } from '@/components/military/MilitaryForm'
import { getLabel, MILITARY_TYPE_OPTIONS } from '@/lib/utils/constants'

interface EditMilitaryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditMilitaryPage({ params }: EditMilitaryPageProps) {
  const { id } = await params
  const military = await getMilitary(id)

  if (!military) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Επεξεργασία: {military.surname} {military.first_name}
        </h1>
        <p className="text-muted-foreground">
          {getLabel(MILITARY_TYPE_OPTIONS, military.military_type)} - Ενημέρωση στοιχείων
        </p>
      </div>

      <MilitaryForm mode="edit" military={military} />
    </div>
  )
}
