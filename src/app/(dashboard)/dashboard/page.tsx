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
      title: 'Πολίτες',
      fullTitle: 'Συνολικοί Πολίτες',
      value: stats.totalCitizens,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Στρατιωτικοί',
      fullTitle: 'Στρατιωτικοί',
      value: stats.totalMilitary,
      subtitle: `${stats.totalConscripts} κλ., ${stats.totalPermanent} μόν.`,
      fullSubtitle: `${stats.totalConscripts} κληρωτοί, ${stats.totalPermanent} μόνιμοι`,
      icon: Shield,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Ενεργά',
      fullTitle: 'Ενεργά Αιτήματα',
      value: stats.activeRequests,
      icon: FileText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: '>25 ημ.',
      fullTitle: 'Εκκρεμή > 25 ημέρες',
      value: stats.pendingOver25Days,
      icon: Clock,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Ολοκλ.',
      fullTitle: 'Ολοκληρωμένα',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Επικοιν.',
      fullTitle: 'Επικοινωνίες',
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
        <div className="p-4 md:p-6">
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
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats Grid - 2 cols on mobile, 3 on md, 6 on xl */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  <span className="sm:hidden">{stat.title}</span>
                  <span className="hidden sm:inline">{stat.fullTitle}</span>
                </CardTitle>
                <div className={`rounded-full p-1.5 sm:p-2 ${stat.bgColor} shrink-0`}>
                  <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
                {loading ? (
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                        <span className="sm:hidden">{stat.subtitle}</span>
                        <span className="hidden sm:inline">{stat.fullSubtitle || stat.subtitle}</span>
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 - stack on mobile */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Αιτήματα ανά Κατηγορία</span>
                <span className="sm:hidden">Κατηγορίες</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
              {loading ? (
                <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CategoryChart data={stats.requestsByCategory} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Μηνιαία Τάση</span>
                <span className="sm:hidden">Τάση</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
              {loading ? (
                <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
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
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Κατάσταση Αιτημάτων</span>
                <span className="sm:hidden">Κατάσταση</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
              {loading ? (
                <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <StatusChart data={stats.requestsByStatus} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Πρόσφατη Δραστηριότητα</span>
                <span className="sm:hidden">Δραστηριότητα</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
              {loading ? (
                <div className="flex h-[250px] sm:h-[300px] items-center justify-center">
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
