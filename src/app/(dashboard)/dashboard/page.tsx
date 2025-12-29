'use client'

import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Clock, CheckCircle } from 'lucide-react'

const stats = [
  {
    title: 'Συνολικοί Πολίτες',
    value: '0',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Ενεργά Αιτήματα',
    value: '0',
    icon: FileText,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    title: 'Εκκρεμή > 25 ημέρες',
    value: '0',
    icon: Clock,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  {
    title: 'Ολοκληρωμένα',
    value: '0',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
]

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
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
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder for charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Αιτήματα ανά Κατηγορία</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Συνδέστε τη Supabase για να δείτε τα δεδομένα
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Μηνιαία Τάση</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              Συνδέστε τη Supabase για να δείτε τα δεδομένα
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
