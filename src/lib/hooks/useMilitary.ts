'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MilitaryPersonnel } from '@/types/database'

interface CitizenInfo {
  id: string
  surname: string
  first_name: string
  mobile: string | null
  email: string | null
}

// Extended interface with request counts
export interface MilitaryWithCitizen extends MilitaryPersonnel {
  citizen?: CitizenInfo | null
  requests_pending: number
  requests_completed: number
  requests_not_completed: number
  requests_total: number
}

interface UseMilitaryOptions {
  militaryType?: string
  essoYear?: number
}

export function useMilitary(options: UseMilitaryOptions = {}) {
  const [military, setMilitary] = useState<MilitaryWithCitizen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchMilitary = useCallback(async () => {
    try {
      setLoading(true)

      // First fetch military personnel
      let query = supabase
        .from('military_personnel')
        .select('*')
        .order('created_at', { ascending: false })

      if (options.militaryType) {
        query = query.eq('military_type', options.militaryType)
      }

      if (options.essoYear) {
        query = query.eq('esso_year', options.essoYear)
      }

      const { data: militaryData, error: militaryError } = await query

      if (militaryError) throw militaryError

      if (!militaryData || militaryData.length === 0) {
        setMilitary([])
        return
      }

      // Get unique citizen IDs (filter out nulls)
      const citizenIds = [...new Set(militaryData.map((m) => m.citizen_id).filter(Boolean))] as string[]

      // Fetch citizens if there are any
      let citizenMap = new Map<string, CitizenInfo>()
      if (citizenIds.length > 0) {
        const { data: citizensData } = await supabase
          .from('citizens')
          .select('id, surname, first_name, mobile, email')
          .in('id', citizenIds)

        citizensData?.forEach((citizen) => {
          citizenMap.set(citizen.id, citizen)
        })
      }

      // Fetch requests for all citizen IDs to count by status
      const requestCounts = new Map<string, { pending: number; completed: number; not_completed: number }>()
      if (citizenIds.length > 0) {
        const { data: requestsData } = await supabase
          .from('requests')
          .select('citizen_id, status')
          .in('citizen_id', citizenIds)

        requestsData?.forEach((request) => {
          const counts = requestCounts.get(request.citizen_id) || { pending: 0, completed: 0, not_completed: 0 }
          if (request.status === 'PENDING') counts.pending++
          else if (request.status === 'COMPLETED') counts.completed++
          else if (request.status === 'NOT_COMPLETED') counts.not_completed++
          requestCounts.set(request.citizen_id, counts)
        })
      }

      // Combine military with citizen data and request counts
      const militaryWithCitizens: MilitaryWithCitizen[] = militaryData.map((m) => {
        const counts = m.citizen_id ? requestCounts.get(m.citizen_id) || { pending: 0, completed: 0, not_completed: 0 } : { pending: 0, completed: 0, not_completed: 0 }
        return {
          ...m,
          citizen: m.citizen_id ? citizenMap.get(m.citizen_id) || null : null,
          requests_pending: counts.pending,
          requests_completed: counts.completed,
          requests_not_completed: counts.not_completed,
          requests_total: counts.pending + counts.completed + counts.not_completed,
        }
      })

      setMilitary(militaryWithCitizens)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.militaryType, options.essoYear])

  useEffect(() => {
    fetchMilitary()

    // Real-time subscription for military personnel
    const militaryChannel = supabase
      .channel('military-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'military_personnel' },
        () => {
          fetchMilitary()
        }
      )
      .subscribe()

    // Real-time subscription for requests (to update counts)
    const requestsChannel = supabase
      .channel('requests-changes-for-military')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => {
          fetchMilitary()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(militaryChannel)
      supabase.removeChannel(requestsChannel)
    }
  }, [supabase, fetchMilitary])

  return { military, loading, error, refetch: fetchMilitary }
}
