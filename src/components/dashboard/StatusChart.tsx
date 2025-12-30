'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { REQUEST_STATUS_OPTIONS, getLabel } from '@/lib/utils/constants'

interface StatusChartProps {
  data: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#22c55e', // Green
  PENDING: '#f59e0b', // Amber/Yellow
  NOT_COMPLETED: '#6b7280', // Gray
}

export function StatusChart({ data }: StatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Δεν υπάρχουν δεδομένα
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: getLabel(REQUEST_STATUS_OPTIONS, item.status),
    value: item.count,
    status: item.status,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value} αιτήματα`, 'Πλήθος']}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
