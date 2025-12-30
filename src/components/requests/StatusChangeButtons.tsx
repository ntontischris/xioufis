'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { changeRequestStatus } from '@/lib/actions/requests'
import { REQUEST_STATUS_OPTIONS } from '@/lib/utils/constants'
import { Loader2, Check, Clock, X } from 'lucide-react'

interface StatusChangeButtonsProps {
  requestId: string
  currentStatus: string
}

export function StatusChangeButtons({ requestId, currentStatus }: StatusChangeButtonsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: 'PENDING' | 'COMPLETED' | 'NOT_COMPLETED') => {
    if (newStatus === currentStatus) return

    setIsPending(newStatus)
    try {
      const result = await changeRequestStatus(requestId, newStatus)

      if (result.success) {
        toast.success('Η κατάσταση ενημερώθηκε επιτυχώς')
        router.refresh()
      } else {
        toast.error(result.error || 'Προέκυψε σφάλμα')
      }
    } catch {
      toast.error('Προέκυψε απροσδόκητο σφάλμα')
    } finally {
      setIsPending(null)
    }
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="mr-2 h-4 w-4" />
      case 'PENDING':
        return <Clock className="mr-2 h-4 w-4" />
      case 'NOT_COMPLETED':
        return <X className="mr-2 h-4 w-4" />
      default:
        return null
    }
  }

  const getVariant = (status: string): 'default' | 'outline' | 'secondary' => {
    if (status === currentStatus) return 'default'
    return 'outline'
  }

  return (
    <div className="flex flex-col gap-2">
      {REQUEST_STATUS_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={getVariant(option.value)}
          size="sm"
          className="w-full justify-start"
          disabled={isPending !== null}
          onClick={() =>
            handleStatusChange(option.value as 'PENDING' | 'COMPLETED' | 'NOT_COMPLETED')
          }
        >
          {isPending === option.value ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            getIcon(option.value)
          )}
          {option.label}
        </Button>
      ))}
    </div>
  )
}
