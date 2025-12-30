'use client'

import { useEffect, useCallback } from 'react'

export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const warningMessage = message || 'Έχετε μη αποθηκευμένες αλλαγές. Είστε σίγουροι ότι θέλετε να φύγετε;'

  // Handle browser/tab close
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = warningMessage
        return warningMessage
      }
    },
    [isDirty, warningMessage]
  )

  useEffect(() => {
    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, handleBeforeUnload])

  return { isDirty }
}
