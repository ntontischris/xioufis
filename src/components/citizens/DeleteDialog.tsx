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
import { archiveCitizen, deleteCitizen } from '@/lib/actions/citizens'
import { Loader2, Trash2, Archive } from 'lucide-react'

interface DeleteDialogProps {
  citizenId: string
  citizenName: string
  variant?: 'archive' | 'delete'
  trigger?: React.ReactNode
}

export function DeleteDialog({
  citizenId,
  citizenName,
  variant = 'archive',
  trigger,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const isDelete = variant === 'delete'
  const title = isDelete ? 'Οριστική Διαγραφή' : 'Αρχειοθέτηση'
  const description = isDelete
    ? `Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά τον πολίτη "${citizenName}"; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.`
    : `Είστε σίγουροι ότι θέλετε να αρχειοθετήσετε τον πολίτη "${citizenName}"; Ο πολίτης θα μεταφερθεί στο αρχείο και μπορεί να επαναφερθεί αργότερα.`

  const handleAction = async () => {
    setIsPending(true)
    try {
      const result = isDelete
        ? await deleteCitizen(citizenId)
        : await archiveCitizen(citizenId)

      if (result.success) {
        // Store success message in sessionStorage to show after redirect
        sessionStorage.setItem(
          'citizen_action_success',
          isDelete ? 'Ο πολίτης διαγράφηκε επιτυχώς' : 'Ο πολίτης αρχειοθετήθηκε επιτυχώς'
        )
        // Navigate immediately - no state changes to prevent re-render
        window.location.replace('/dashboard/citizens')
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
          <Button variant={isDelete ? 'destructive' : 'outline'}>
            {isDelete ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Αρχειοθέτηση
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            variant={isDelete ? 'destructive' : 'default'}
            onClick={handleAction}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Επεξεργασία...
              </>
            ) : isDelete ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Διαγραφή
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" />
                Αρχειοθέτηση
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
