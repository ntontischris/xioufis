'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getLabel, MILITARY_TYPE_OPTIONS } from '@/lib/utils/constants'
import { MobileCard, MobileCardHeader, MobileCardRow, ResponsiveTableWrapper } from '@/components/ui/MobileCard'
import { User, Shield, ClipboardList, ChevronRight } from 'lucide-react'
import type { MilitaryWithCitizen } from '@/lib/hooks/useMilitary'

interface MilitaryTableProps {
  military: MilitaryWithCitizen[]
}

export function MilitaryTable({ military }: MilitaryTableProps) {
  const router = useRouter()

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Don't navigate if clicking a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/dashboard/military/${id}`)
  }

  // Mobile card view
  const mobileCards = military.map((m) => (
    <MobileCard
      key={m.id}
      onClick={(e) => handleRowClick(m.id, e)}
    >
      <MobileCardHeader
        action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="flex items-center gap-2">
          {m.military_type === 'CONSCRIPT' ? (
            <User className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Shield className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">
              {m.surname} {m.first_name}
              {m.father_name && (
                <span className="text-muted-foreground ml-1">({m.father_name})</span>
              )}
            </div>
          </div>
        </div>
      </MobileCardHeader>

      <div className="space-y-1">
        <MobileCardRow label="Τύπος">
          <Badge variant={m.military_type === 'CONSCRIPT' ? 'secondary' : 'default'}>
            {getLabel(MILITARY_TYPE_OPTIONS, m.military_type)}
          </Badge>
        </MobileCardRow>
        <MobileCardRow label="ΕΣΣΟ/Βαθμός">
          {m.military_type === 'CONSCRIPT' && m.esso_year && m.esso_letter
            ? `${m.esso_year}${m.esso_letter}`
            : m.military_type === 'PERMANENT' && m.rank
            ? m.rank
            : '-'}
        </MobileCardRow>
        {m.mobile && (
          <MobileCardRow label="Κινητό">
            {m.mobile}
          </MobileCardRow>
        )}
        <MobileCardRow label="Τοποθέτηση">
          {m.military_type === 'CONSCRIPT'
            ? m.assignment || m.training_center || '-'
            : m.service_unit || '-'}
        </MobileCardRow>
        {m.requests_total > 0 && m.citizen_id && (
          <MobileCardRow label="Αιτήματα">
            <Link
              href={`/dashboard/requests?citizen=${m.citizen_id}`}
              className="flex items-center gap-1 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {m.requests_pending > 0 && (
                  <Badge variant="destructive" className="mr-1 text-xs">
                    {m.requests_pending} εκκρεμή
                  </Badge>
                )}
                {m.requests_completed > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {m.requests_completed} ολοκλ.
                  </Badge>
                )}
              </span>
            </Link>
          </MobileCardRow>
        )}
      </div>
    </MobileCard>
  ))

  // Desktop table view
  const desktopTable = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ονοματεπώνυμο</TableHead>
          <TableHead>Τύπος</TableHead>
          <TableHead className="hidden sm:table-cell">ΕΣΣΟ</TableHead>
          <TableHead className="hidden lg:table-cell">Κινητό</TableHead>
          <TableHead className="hidden md:table-cell">Τοποθέτηση/Μονάδα</TableHead>
          <TableHead className="hidden sm:table-cell">Αιτήματα</TableHead>
          <TableHead className="text-right">Ενέργειες</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {military.map((m) => (
          <TableRow
            key={m.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={(e) => handleRowClick(m.id, e)}
          >
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {m.military_type === 'CONSCRIPT' ? (
                  <User className="h-4 w-4 text-muted-foreground hidden sm:block" />
                ) : (
                  <Shield className="h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
                <span>
                  {m.surname} {m.first_name}
                  {m.father_name && (
                    <span className="text-muted-foreground hidden lg:inline"> ({m.father_name})</span>
                  )}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={m.military_type === 'CONSCRIPT' ? 'secondary' : 'default'}>
                {getLabel(MILITARY_TYPE_OPTIONS, m.military_type)}
              </Badge>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {m.military_type === 'CONSCRIPT' && m.esso_year && m.esso_letter
                ? `${m.esso_year}${m.esso_letter}`
                : m.military_type === 'PERMANENT' && m.rank
                ? m.rank
                : '-'}
            </TableCell>
            <TableCell className="hidden lg:table-cell">{m.mobile || '-'}</TableCell>
            <TableCell className="hidden md:table-cell">
              {m.military_type === 'CONSCRIPT'
                ? m.assignment || m.training_center || '-'
                : m.service_unit || '-'}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {m.requests_total > 0 && m.citizen_id ? (
                <Link
                  href={`/dashboard/requests?citizen=${m.citizen_id}`}
                  className="flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {m.requests_pending > 0 && (
                      <Badge variant="destructive" className="mr-1 text-xs">
                        {m.requests_pending} εκκρεμή
                      </Badge>
                    )}
                    {m.requests_completed > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {m.requests_completed} ολοκλ.
                      </Badge>
                    )}
                  </span>
                </Link>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/military/${m.id}`}>
                  Προβολή
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <ResponsiveTableWrapper mobileView={mobileCards}>
      {desktopTable}
    </ResponsiveTableWrapper>
  )
}
