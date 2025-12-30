'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalCitizens: number
  activeRequests: number
  pendingOver25Days: number
  completedRequests: number
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
  activeRequests: 0,
  pendingOver25Days: 0,
  completedRequests: 0,
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
        requestsResult,
        communicationsResult,
        militaryResult,
      ] = await Promise.all([
        // Total citizens
        supabase.from('citizens').select('id', { count: 'exact', head: true }).eq('is_active', true),
        // All requests for various stats
        supabase.from('requests').select('*'),
        // Recent communications
        supabase.from('communications').select('*').order('communication_date', { ascending: false }).limit(20),
        // Military count
        supabase.from('military_personnel').select('id', { count: 'exact', head: true }),
      ])

      // Process citizens count
      const totalCitizens = citizensResult.count || 0

      // Process requests
      const requests = requestsResult.data || []

      // Active (pending) requests
      const activeRequests = requests.filter((r) => r.status === 'PENDING').length

      // Completed requests
      const completedRequests = requests.filter((r) => r.status === 'COMPLETED').length

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

      // Get citizen IDs for recent activity
      const communicationCitizenIds = [...new Set(communicationsResult.data?.map((c) => c.citizen_id) || [])]

      // Fetch citizens for activity
      let citizenMap = new Map<string, { id: string; surname: string; first_name: string }>()
      if (communicationCitizenIds.length > 0) {
        const { data: citizensData } = await supabase
          .from('citizens')
          .select('id, surname, first_name')
          .in('id', communicationCitizenIds)

        citizensData?.forEach((c) => {
          citizenMap.set(c.id, c)
        })
      }

      // Build recent activity
      const recentActivity: RecentActivityItem[] = []

      // Add communications to activity
      communicationsResult.data?.slice(0, 10).forEach((comm) => {
        const citizen = citizenMap.get(comm.citizen_id)
        recentActivity.push({
          id: comm.id,
          type: 'communication',
          title: getCommTypeLabel(comm.comm_type),
          description: comm.notes || 'Χωρίς σημείωση',
          date: comm.communication_date,
          citizen: citizen || undefined,
        })
      })

      // Sort by date
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setStats({
        totalCitizens,
        activeRequests,
        pendingOver25Days,
        completedRequests,
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

function getMonthlyTrend(requests: any[]): { month: string; requests: number; completed: number }[] {
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
