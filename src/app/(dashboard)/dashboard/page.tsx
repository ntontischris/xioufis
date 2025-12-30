'use client'

import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { Users, FileText, Clock, CheckCircle, Loader2, PieChart, TrendingUp, Activity, Shield, MessageSquare } from 'lucide-react'

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats()

  const statCards = [
    {
      title: 'Συνολικοί Πολίτες',
      value: stats.totalCitizens,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Στρατιωτικοί',
      value: stats.totalMilitary,
      subtitle: `${stats.totalConscripts} κληρωτοί, ${stats.totalPermanent} μόνιμοι`,
      icon: Shield,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Ενεργά Αιτήματα',
      value: stats.activeRequests,
      icon: FileText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Εκκρεμή > 25 ημέρες',
      value: stats.pendingOver25Days,
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Ολοκληρωμένα',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Επικοινωνίες',
      value: stats.totalCommunications,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  if (error) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="text-center py-8 text-destructive">
            <p>Σφάλμα: {error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Αιτήματα ανά Κατηγορία
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CategoryChart data={stats.requestsByCategory} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Μηνιαία Τάση
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <TrendChart data={stats.monthlyTrend} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Κατάσταση Αιτημάτων
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatusChart data={stats.requestsByStatus} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Πρόσφατη Δραστηριότητα
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <RecentActivity items={stats.recentActivity} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
