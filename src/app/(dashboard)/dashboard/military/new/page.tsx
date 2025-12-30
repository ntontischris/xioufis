import { MilitaryForm } from '@/components/military/MilitaryForm'

export default function NewMilitaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Νέα Εγγραφή</h1>
        <p className="text-muted-foreground">
          Καταχωρήστε νέο στρατιωτικό προσωπικό
        </p>
      </div>

      <MilitaryForm mode="create" />
    </div>
  )
}
