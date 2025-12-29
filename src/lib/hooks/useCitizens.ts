'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Citizen } from '@/types/database'

export function useCitizens() {
  const [citizens, setCitizens] = useState<Citizen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCitizens(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCitizens()

    // Real-time subscription
    const channel = supabase
      .channel('citizens-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citizens' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCitizens((prev) => [payload.new as Citizen, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setCitizens((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Citizen) : c))
            )
          } else if (payload.eventType === 'DELETE') {
            setCitizens((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchCitizens])

  return { citizens, loading, error, refetch: fetchCitizens }
}
