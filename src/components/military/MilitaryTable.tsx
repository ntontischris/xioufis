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
import type { MilitaryPersonnel } from '@/types/database'
import { User, Shield } from 'lucide-react'

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ονοματεπώνυμο</TableHead>
          <TableHead>Τύπος</TableHead>
          <TableHead>ΕΣΣΟ</TableHead>
          <TableHead>Κινητό</TableHead>
          <TableHead>Τοποθέτηση/Μονάδα</TableHead>
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
                  <User className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Shield className="h-4 w-4 text-muted-foreground" />
                )}
                {m.surname} {m.first_name}
                {m.father_name && (
                  <span className="text-muted-foreground">({m.father_name})</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={m.military_type === 'CONSCRIPT' ? 'secondary' : 'default'}>
                {getLabel(MILITARY_TYPE_OPTIONS, m.military_type)}
              </Badge>
            </TableCell>
            <TableCell>
              {m.military_type === 'CONSCRIPT' && m.esso_year && m.esso_letter
                ? `${m.esso_year}${m.esso_letter}`
                : m.military_type === 'PERMANENT' && m.rank
                ? m.rank
                : '-'}
            </TableCell>
            <TableCell>{m.mobile || '-'}</TableCell>
            <TableCell>
              {m.military_type === 'CONSCRIPT'
                ? m.assignment || m.training_center || '-'
                : m.service_unit || '-'}
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
}
