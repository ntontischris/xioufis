import { CitizenForm } from '@/components/citizens/CitizenForm'

export default function NewCitizenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Νέος Πολίτης</h1>
        <p className="text-muted-foreground">
          Συμπληρώστε τα στοιχεία για να δημιουργήσετε νέο πολίτη
        </p>
      </div>

      <CitizenForm mode="create" />
    </div>
  )
}
