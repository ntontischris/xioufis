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
import type { Communication } from '@/types/database'
import { Phone, Mail, Users, MessageSquare, MoreHorizontal } from 'lucide-react'

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showCitizen && <TableHead>Πολίτης</TableHead>}
          <TableHead>Τύπος</TableHead>
          <TableHead>Ημερομηνία</TableHead>
          <TableHead>Σημειώσεις</TableHead>
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
                    className="text-indigo-600 hover:underline"
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
            <TableCell className="max-w-xs truncate">
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
}
