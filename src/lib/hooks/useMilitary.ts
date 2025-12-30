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

interface MilitaryWithCitizen extends MilitaryPersonnel {
  citizen?: CitizenInfo | null
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

      // Combine military with citizen data
      const militaryWithCitizens: MilitaryWithCitizen[] = militaryData.map((m) => ({
        ...m,
        citizen: m.citizen_id ? citizenMap.get(m.citizen_id) || null : null,
      }))

      setMilitary(militaryWithCitizens)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.militaryType, options.essoYear])

  useEffect(() => {
    fetchMilitary()

    // Real-time subscription
    const channel = supabase
      .channel('military-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'military_personnel' },
        () => {
          fetchMilitary()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchMilitary])

  return { military, loading, error, refetch: fetchMilitary }
}
