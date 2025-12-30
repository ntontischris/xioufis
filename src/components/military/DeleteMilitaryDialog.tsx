'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteMilitary } from '@/lib/actions/military'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteMilitaryDialogProps {
  militaryId: string
  militaryName: string
  trigger?: React.ReactNode
}

export function DeleteMilitaryDialog({ militaryId, militaryName, trigger }: DeleteMilitaryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteMilitary(militaryId)

      if (result.success) {
        sessionStorage.setItem('military_action_success', 'Η εγγραφή διαγράφηκε επιτυχώς')
        window.location.replace('/dashboard/military')
      } else {
        toast.error(result.error || 'Προέκυψε σφάλμα')
        setIsPending(false)
      }
    } catch {
      toast.error('Προέκυψε απροσδόκητο σφάλμα')
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Διαγραφή
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Διαγραφή Εγγραφής</DialogTitle>
          <DialogDescription>
            Είστε σίγουροι ότι θέλετε να διαγράψετε την εγγραφή για τον/την &quot;{militaryName}&quot;; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Ακύρωση
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Διαγραφή...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
