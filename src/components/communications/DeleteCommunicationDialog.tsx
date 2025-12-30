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
import { deleteCommunication } from '@/lib/actions/communications'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteCommunicationDialogProps {
  communicationId: string
  trigger?: React.ReactNode
}

export function DeleteCommunicationDialog({ communicationId, trigger }: DeleteCommunicationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteCommunication(communicationId)

      if (result.success) {
        sessionStorage.setItem('communication_action_success', 'Η επικοινωνία διαγράφηκε επιτυχώς')
        window.location.replace('/dashboard/communications')
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
          <DialogTitle>Διαγραφή Επικοινωνίας</DialogTitle>
          <DialogDescription>
            Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την επικοινωνία; Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
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
