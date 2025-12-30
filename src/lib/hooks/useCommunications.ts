'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Communication } from '@/types/database'

interface CitizenInfo {
  id: string
  surname: string
  first_name: string
  mobile: string | null
  email: string | null
}

interface CommunicationWithCitizen extends Communication {
  citizen?: CitizenInfo | null
}

interface UseCommunicationsOptions {
  citizenId?: string
  commType?: string
}

export function useCommunications(options: UseCommunicationsOptions = {}) {
  const [communications, setCommunications] = useState<CommunicationWithCitizen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCommunications = useCallback(async () => {
    try {
      setLoading(true)

      // First fetch communications
      let query = supabase
        .from('communications')
        .select('*')
        .order('communication_date', { ascending: false })

      if (options.citizenId) {
        query = query.eq('citizen_id', options.citizenId)
      }

      if (options.commType) {
        query = query.eq('comm_type', options.commType)
      }

      const { data: communicationsData, error: communicationsError } = await query

      if (communicationsError) throw communicationsError

      if (!communicationsData || communicationsData.length === 0) {
        setCommunications([])
        return
      }

      // Get unique citizen IDs
      const citizenIds = [...new Set(communicationsData.map((c) => c.citizen_id))]

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

      // Combine communications with citizen data
      const communicationsWithCitizens: CommunicationWithCitizen[] = communicationsData.map(
        (communication) => ({
          ...communication,
          citizen: citizenMap.get(communication.citizen_id) || null,
        })
      )

      setCommunications(communicationsWithCitizens)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.citizenId, options.commType])

  useEffect(() => {
    fetchCommunications()

    // Real-time subscription
    const channel = supabase
      .channel('communications-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'communications' },
        () => {
          // Refetch to get citizen data with the update
          fetchCommunications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchCommunications])

  return { communications, loading, error, refetch: fetchCommunications }
}
