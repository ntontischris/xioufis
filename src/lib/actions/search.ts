'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeForSearch } from '@/lib/utils'

export interface SearchResult {
  id: string
  type: 'citizen' | 'request' | 'communication' | 'military'
  title: string
  subtitle: string
  href: string
}

export interface SearchResults {
  citizens: SearchResult[]
  requests: SearchResult[]
  communications: SearchResult[]
  military: SearchResult[]
}

/**
 * Check if any of the fields match the search query (accent & case insensitive)
 */
function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const normalizedQuery = normalizeForSearch(query)
  return fields.some(field => {
    if (!field) return false
    return normalizeForSearch(field).includes(normalizedQuery)
  })
}

export async function globalSearch(query: string): Promise<SearchResults> {
  if (!query || query.length < 2) {
    return {
      citizens: [],
      requests: [],
      communications: [],
      military: []
    }
  }

  const supabase = await createClient()

  // Fetch more results than needed, then filter client-side for accent-insensitive matching
  // We use a broader search pattern to catch potential matches
  const searchTerm = `%${query}%`

  // Search citizens - fetch more and filter
  const { data: allCitizens } = await supabase
    .from('citizens')
    .select('id, surname, first_name, mobile, email')
    .or(`surname.ilike.${searchTerm},first_name.ilike.${searchTerm},mobile.ilike.${searchTerm},email.ilike.${searchTerm}`)
    .limit(50)

  // Also search without relying on ilike for accent matching - get recent citizens
  const { data: recentCitizens } = await supabase
    .from('citizens')
    .select('id, surname, first_name, mobile, email')
    .order('updated_at', { ascending: false })
    .limit(100)

  // Merge and deduplicate, then filter
  const citizenMap = new Map<string, typeof allCitizens extends (infer T)[] | null ? T : never>()
  ;[...(allCitizens || []), ...(recentCitizens || [])].forEach(c => {
    if (c && !citizenMap.has(c.id)) citizenMap.set(c.id, c)
  })

  const citizens = Array.from(citizenMap.values())
    .filter(c => matchesQuery(query, c.surname, c.first_name, c.mobile, c.email))
    .slice(0, 5)

  // Search requests with citizen info
  const { data: requests } = await supabase
    .from('requests')
    .select('id, category, request_text, citizen_id')
    .ilike('request_text', searchTerm)
    .limit(5)

  // Search communications with citizen info
  const { data: communications } = await supabase
    .from('communications')
    .select('id, comm_type, notes, citizen_id')
    .ilike('notes', searchTerm)
    .limit(5)

  // Search military personnel - same approach
  const { data: allMilitary } = await supabase
    .from('military_personnel')
    .select('id, surname, first_name, military_type, mobile')
    .or(`surname.ilike.${searchTerm},first_name.ilike.${searchTerm},mobile.ilike.${searchTerm}`)
    .limit(50)

  const { data: recentMilitary } = await supabase
    .from('military_personnel')
    .select('id, surname, first_name, military_type, mobile')
    .order('updated_at', { ascending: false })
    .limit(100)

  const militaryMap = new Map<string, typeof allMilitary extends (infer T)[] | null ? T : never>()
  ;[...(allMilitary || []), ...(recentMilitary || [])].forEach(m => {
    if (m && !militaryMap.has(m.id)) militaryMap.set(m.id, m)
  })

  const military = Array.from(militaryMap.values())
    .filter(m => matchesQuery(query, m.surname, m.first_name, m.mobile))
    .slice(0, 5)

  // Format results
  const citizenResults: SearchResult[] = (citizens || []).map(c => ({
    id: c.id,
    type: 'citizen' as const,
    title: `${c.surname} ${c.first_name}`,
    subtitle: c.mobile || c.email || '',
    href: `/dashboard/citizens/${c.id}`
  }))

  const requestResults: SearchResult[] = (requests || []).map(r => ({
    id: r.id,
    type: 'request' as const,
    title: r.request_text?.substring(0, 50) + ((r.request_text?.length ?? 0) > 50 ? '...' : '') || r.category,
    subtitle: r.category,
    href: `/dashboard/requests/${r.id}`
  }))

  const communicationResults: SearchResult[] = (communications || []).map(c => ({
    id: c.id,
    type: 'communication' as const,
    title: c.notes?.substring(0, 50) + ((c.notes?.length ?? 0) > 50 ? '...' : '') || c.comm_type,
    subtitle: c.comm_type,
    href: `/dashboard/communications`
  }))

  const militaryResults: SearchResult[] = (military || []).map(m => ({
    id: m.id,
    type: 'military' as const,
    title: `${m.surname} ${m.first_name}`,
    subtitle: m.military_type === 'CONSCRIPT' ? 'Κληρωτός' : 'Μόνιμος',
    href: `/dashboard/military/${m.id}`
  }))

  return {
    citizens: citizenResults,
    requests: requestResults,
    communications: communicationResults,
    military: militaryResults
  }
}
