'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Citizen } from '@/types/database'

// Extended citizen type with request counts
export interface CitizenWithRequests extends Citizen {
  requests_pending: number
  requests_completed: number
  requests_not_completed: number
  requests_total: number
}

export function useCitizens() {
  const [citizens, setCitizens] = useState<CitizenWithRequests[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCitizens = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch citizens
      const { data: citizensData, error: citizensError } = await supabase
        .from('citizens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (citizensError) throw citizensError

      // Fetch all requests to count by citizen and status
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('citizen_id, status')

      if (requestsError) throw requestsError

      // Build request counts map
      const requestCounts = new Map<string, { pending: number; completed: number; not_completed: number }>()

      requestsData?.forEach((request) => {
        const counts = requestCounts.get(request.citizen_id) || { pending: 0, completed: 0, not_completed: 0 }
        if (request.status === 'PENDING') counts.pending++
        else if (request.status === 'COMPLETED') counts.completed++
        else if (request.status === 'NOT_COMPLETED') counts.not_completed++
        requestCounts.set(request.citizen_id, counts)
      })

      // Merge citizens with request counts
      const citizensWithRequests: CitizenWithRequests[] = (citizensData || []).map((citizen) => {
        const counts = requestCounts.get(citizen.id) || { pending: 0, completed: 0, not_completed: 0 }
        return {
          ...citizen,
          requests_pending: counts.pending,
          requests_completed: counts.completed,
          requests_not_completed: counts.not_completed,
          requests_total: counts.pending + counts.completed + counts.not_completed,
        }
      })

      setCitizens(citizensWithRequests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCitizens()

    // Real-time subscription for citizens
    const citizensChannel = supabase
      .channel('citizens-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'citizens' },
        () => {
          // Refetch all data to maintain consistency with request counts
          fetchCitizens()
        }
      )
      .subscribe()

    // Real-time subscription for requests (to update counts)
    const requestsChannel = supabase
      .channel('requests-changes-for-citizens')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          // Refetch all data when requests change
          fetchCitizens()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(citizensChannel)
      supabase.removeChannel(requestsChannel)
    }
  }, [supabase, fetchCitizens])

  return { citizens, loading, error, refetch: fetchCitizens }
}
