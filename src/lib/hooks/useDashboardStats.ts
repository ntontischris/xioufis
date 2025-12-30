'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalCitizens: number
  totalMilitary: number
  totalConscripts: number
  totalPermanent: number
  activeRequests: number
  pendingOver25Days: number
  completedRequests: number
  totalCommunications: number
  requestsByCategory: { category: string; count: number }[]
  requestsByStatus: { status: string; count: number }[]
  recentActivity: RecentActivityItem[]
  monthlyTrend: { month: string; requests: number; completed: number }[]
}

export interface RecentActivityItem {
  id: string
  type: 'request' | 'communication' | 'military'
  title: string
  description: string
  date: string
  citizen?: {
    id: string
    surname: string
    first_name: string
  }
}

const initialStats: DashboardStats = {
  totalCitizens: 0,
  totalMilitary: 0,
  totalConscripts: 0,
  totalPermanent: 0,
  activeRequests: 0,
  pendingOver25Days: 0,
  completedRequests: 0,
  totalCommunications: 0,
  requestsByCategory: [],
  requestsByStatus: [],
  recentActivity: [],
  monthlyTrend: [],
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all stats in parallel
      const [
        citizensResult,
        activeRequestsCount,
        completedRequestsCount,
        allRequestsResult,
        communicationsCountResult,
        recentCommunicationsResult,
        militaryResult,
      ] = await Promise.all([
        // Total citizens
        supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('is_active', true),
        // Active requests count (not completed)
        supabase.from('requests').select('id', { count: 'exact', head: true }).neq('status', 'COMPLETED'),
        // Completed requests count
        supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
        // All requests for charts and activity
        supabase.from('requests').select('*').order('submitted_at', { ascending: false }),
        // Total communications count
        supabase.from('communications').select('id', { count: 'exact', head: true }),
        // Recent communications for activity feed
        supabase.from('communications').select('*').order('communication_date', { ascending: false }).limit(10),
        // All military personnel
        supabase.from('military_personnel').select('*').order('created_at', { ascending: false }),
      ])

      // Process citizens count
      const totalCitizens = citizensResult.count || 0

      // Process military
      const militaryData = militaryResult.data || []
      const totalMilitary = militaryData.length
      const totalConscripts = militaryData.filter((m) => m.military_type === 'CONSCRIPT').length
      const totalPermanent = militaryData.filter((m) => m.military_type === 'PERMANENT').length

      // Process communications
      const totalCommunications = communicationsCountResult.count || 0
      const recentCommunications = recentCommunicationsResult.data || []

      // Process requests
      const requests = allRequestsResult.data || []

      // Active requests (not completed) - use count query result
      const activeRequests = activeRequestsCount.count || 0

      // Completed requests - use count query result
      const completedRequests = completedRequestsCount.count || 0

      // Pending over 25 days
      const today = new Date()
      const pendingOver25Days = requests.filter((r) => {
        if (r.status !== 'PENDING') return false
        const submittedDate = new Date(r.submitted_at)
        const diffDays = Math.floor((today.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays > 25
      }).length

      // Requests by category
      const categoryMap = new Map<string, number>()
      requests.forEach((r) => {
        categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1)
      })
      const requestsByCategory = Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      // Requests by status
      const statusMap = new Map<string, number>()
      requests.forEach((r) => {
        statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1)
      })
      const requestsByStatus = Array.from(statusMap.entries())
        .map(([status, count]) => ({ status, count }))

      // Monthly trend (last 6 months)
      const monthlyTrend = getMonthlyTrend(requests)

      // Build recent activity from multiple sources
      const recentActivity: RecentActivityItem[] = []

      // Add communications to activity
      recentCommunications.slice(0, 5).forEach((comm) => {
        recentActivity.push({
          id: comm.id,
          type: 'communication',
          title: getCommTypeLabel(comm.comm_type),
          description: comm.notes || 'Χωρίς σημείωση',
          date: comm.communication_date,
        })
      })

      // Add recent military registrations to activity
      militaryData.slice(0, 5).forEach((m) => {
        recentActivity.push({
          id: m.id,
          type: 'military',
          title: m.military_type === 'CONSCRIPT' ? 'Νέος Στρατιώτης' : 'Νέος Μόνιμος',
          description: `${m.surname} ${m.first_name}`,
          date: m.created_at,
        })
      })

      // Add recent requests to activity
      requests.slice(0, 5).forEach((r) => {
        recentActivity.push({
          id: r.id,
          type: 'request',
          title: getCategoryLabel(r.category),
          description: r.request_text?.substring(0, 50) || r.status,
          date: r.submitted_at,
        })
      })

      // Sort by date and take top 10
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setStats({
        totalCitizens,
        totalMilitary,
        totalConscripts,
        totalPermanent,
        activeRequests,
        pendingOver25Days,
        completedRequests,
        totalCommunications,
        requestsByCategory,
        requestsByStatus,
        recentActivity: recentActivity.slice(0, 10),
        monthlyTrend,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()

    // Real-time subscriptions for all relevant tables
    const channels = [
      supabase
        .channel('dashboard-citizens')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'citizens' }, fetchStats)
        .subscribe(),
      supabase
        .channel('dashboard-requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchStats)
        .subscribe(),
      supabase
        .channel('dashboard-communications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'communications' }, fetchStats)
        .subscribe(),
      supabase
        .channel('dashboard-military')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'military_personnel' }, fetchStats)
        .subscribe(),
    ]

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [supabase, fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

function getCommTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PHONE: 'Τηλεφώνημα',
    EMAIL: 'Email',
    IN_PERSON: 'Προσωπική επαφή',
  }
  return labels[type] || type
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    MILITARY: 'Στρατιωτικό',
    MEDICAL: 'Ιατρικό',
    POLICE: 'Αστυνομικό',
    FIRE_DEPARTMENT: 'Πυροσβεστική',
    EDUCATION: 'Παιδείας',
    ADMINISTRATIVE: 'Διοικητικό',
    JOB_SEARCH: 'Εύρεση Εργασίας',
    SOCIAL_SECURITY: 'ΕΦΚΑ',
    OTHER: 'Άλλο',
  }
  return labels[category] || category
}

function getMonthlyTrend(requests: { submitted_at: string; status: string }[]): { month: string; requests: number; completed: number }[] {
  const months: { month: string; requests: number; completed: number }[] = []
  const today = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('el-GR', { month: 'short' })

    const monthRequests = requests.filter((r) => {
      const submitted = new Date(r.submitted_at)
      return submitted.getFullYear() === date.getFullYear() && submitted.getMonth() === date.getMonth()
    })

    const completed = monthRequests.filter((r) => r.status === 'COMPLETED').length

    months.push({
      month: monthLabel,
      requests: monthRequests.length,
      completed,
    })
  }

  return months
}
