'use server'

import { createClient } from '@/lib/supabase/server'

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
  const searchTerm = `%${query}%`

  // Search citizens
  const { data: citizens } = await supabase
    .from('citizens')
    .select('id, surname, first_name, mobile, email')
    .or(`surname.ilike.${searchTerm},first_name.ilike.${searchTerm},mobile.ilike.${searchTerm},email.ilike.${searchTerm}`)
    .limit(5)

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

  // Search military personnel
  const { data: military } = await supabase
    .from('military_personnel')
    .select('id, surname, first_name, military_type, mobile')
    .or(`surname.ilike.${searchTerm},first_name.ilike.${searchTerm},mobile.ilike.${searchTerm}`)
    .limit(5)

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
