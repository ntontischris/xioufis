'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Request } from '@/types/database'

interface CitizenInfo {
  id: string
  surname: string
  first_name: string
  mobile: string | null
  email: string | null
}

interface RequestWithCitizen extends Request {
  citizen?: CitizenInfo | null
}

interface UseRequestsOptions {
  citizenId?: string
  status?: string
}

export function useRequests(options: UseRequestsOptions = {}) {
  const [requests, setRequests] = useState<RequestWithCitizen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)

      // First fetch requests
      let query = supabase
        .from('requests')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (options.citizenId) {
        query = query.eq('citizen_id', options.citizenId)
      }

      if (options.status) {
        query = query.eq('status', options.status)
      }

      const { data: requestsData, error: requestsError } = await query

      if (requestsError) throw requestsError

      if (!requestsData || requestsData.length === 0) {
        setRequests([])
        return
      }

      // Get unique citizen IDs
      const citizenIds = [...new Set(requestsData.map((r) => r.citizen_id))]

      // Fetch citizens
      const { data: citizensData } = await supabase
        .from('citizens')
        .select('id, surname, first_name, mobile, email')
        .in('id', citizenIds)

      // Create a map of citizen ID to citizen data
      const citizenMap = new Map<string, CitizenInfo>()
      citizensData?.forEach((citizen) => {
        citizenMap.set(citizen.id, citizen)
      })

      // Combine requests with citizen data
      const requestsWithCitizens: RequestWithCitizen[] = requestsData.map((request) => ({
        ...request,
        citizen: citizenMap.get(request.citizen_id) || null,
      }))

      setRequests(requestsWithCitizens)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.citizenId, options.status])

  useEffect(() => {
    fetchRequests()

    // Real-time subscription
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          // Refetch to get citizen data with the update
          fetchRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchRequests])

  return { requests, loading, error, refetch: fetchRequests }
}
