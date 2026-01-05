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
import { getLabel, COMMUNICATION_TYPE_OPTIONS } from '@/lib/utils/constants'
import { MobileCard, MobileCardHeader, MobileCardRow, ResponsiveTableWrapper } from '@/components/ui/MobileCard'
import type { Communication } from '@/types/database'
import { Phone, Mail, Users, MessageSquare, MoreHorizontal, ChevronRight } from 'lucide-react'

interface CitizenInfo {
  id: string
  surname: string
  first_name: string
  mobile: string | null
  email: string | null
}

interface CommunicationWithCitizen extends Communication {
  citizen?: CitizenInfo | null
}

interface CommunicationTableProps {
  communications: CommunicationWithCitizen[]
  showCitizen?: boolean
}

const typeIcons: Record<string, React.ReactNode> = {
  PHONE: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  IN_PERSON: <Users className="h-4 w-4" />,
  SMS: <MessageSquare className="h-4 w-4" />,
  OTHER: <MoreHorizontal className="h-4 w-4" />,
}

export function CommunicationTable({ communications, showCitizen = true }: CommunicationTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('el-GR')
  }

  const handleRowClick = (communicationId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/dashboard/communications/${communicationId}`)
  }

  // Mobile card view
  const mobileCards = communications.map((comm) => (
    <MobileCard
      key={comm.id}
      onClick={(e) => handleRowClick(comm.id, e)}
    >
      <MobileCardHeader
        action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="flex flex-col gap-1">
          {showCitizen && comm.citizen && (
            <Link
              href={`/dashboard/citizens/${comm.citizen.id}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {comm.citizen.surname} {comm.citizen.first_name}
            </Link>
          )}
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            {typeIcons[comm.comm_type] || typeIcons.OTHER}
            {getLabel(COMMUNICATION_TYPE_OPTIONS, comm.comm_type)}
          </Badge>
        </div>
      </MobileCardHeader>

      <div className="space-y-1">
        <MobileCardRow label="Ημερομηνία">
          {formatDate(comm.communication_date)}
        </MobileCardRow>
        {comm.notes && (
          <div className="pt-2 mt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">{comm.notes}</p>
          </div>
        )}
      </div>
    </MobileCard>
  ))

  // Desktop table view
  const desktopTable = (
    <Table>
      <TableHeader>
        <TableRow>
          {showCitizen && <TableHead>Πολίτης</TableHead>}
          <TableHead>Τύπος</TableHead>
          <TableHead>Ημερομηνία</TableHead>
          <TableHead className="hidden lg:table-cell">Σημειώσεις</TableHead>
          <TableHead className="text-right">Ενέργειες</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {communications.map((comm) => (
          <TableRow
            key={comm.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={(e) => handleRowClick(comm.id, e)}
          >
            {showCitizen && (
              <TableCell className="font-medium">
                {comm.citizen ? (
                  <Link
                    href={`/dashboard/citizens/${comm.citizen.id}`}
                    className="text-primary hover:underline"
                  >
                    {comm.citizen.surname} {comm.citizen.first_name}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
            )}
            <TableCell>
              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                {typeIcons[comm.comm_type] || typeIcons.OTHER}
                {getLabel(COMMUNICATION_TYPE_OPTIONS, comm.comm_type)}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(comm.communication_date)}</TableCell>
            <TableCell className="hidden lg:table-cell max-w-xs truncate">
              {comm.notes || '-'}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/communications/${comm.id}`}>
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
