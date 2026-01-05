'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RequestBadge } from './RequestBadge'
import { getLabel, REQUEST_CATEGORY_OPTIONS } from '@/lib/utils/constants'
import { MobileCard, MobileCardHeader, MobileCardRow, ResponsiveTableWrapper } from '@/components/ui/MobileCard'
import { ChevronRight } from 'lucide-react'
import type { Request } from '@/types/database'

interface RequestWithCitizen extends Request {
  citizen?: {
    id: string
    surname: string
    first_name: string
    mobile: string | null
    email: string | null
  } | null
}

interface RequestTableProps {
  requests: RequestWithCitizen[]
  showCitizen?: boolean
}

export function RequestTable({ requests, showCitizen = true }: RequestTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('el-GR')
  }

  const handleRowClick = (requestId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking a link or button
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/dashboard/requests/${requestId}`)
  }

  // Mobile card view for each request
  const mobileCards = requests.map((request) => (
    <MobileCard
      key={request.id}
      onClick={(e) => handleRowClick(request.id, e)}
    >
      <MobileCardHeader
        action={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
      >
        <div className="flex flex-col gap-1">
          {showCitizen && request.citizen && (
            <Link
              href={`/dashboard/citizens/${request.citizen.id}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {request.citizen.surname} {request.citizen.first_name}
            </Link>
          )}
          <span className="text-muted-foreground text-sm">
            {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
          </span>
        </div>
      </MobileCardHeader>

      <div className="space-y-1">
        <MobileCardRow label="Κατάσταση">
          <RequestBadge status={request.status} />
        </MobileCardRow>
        <MobileCardRow label="Αποστολή">
          {formatDate(request.submitted_at)}
        </MobileCardRow>
        {request.completed_at && (
          <MobileCardRow label="Ολοκλήρωση">
            {formatDate(request.completed_at)}
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
          {showCitizen && <TableHead>Πολίτης</TableHead>}
          <TableHead>Κατηγορία</TableHead>
          <TableHead>Κατάσταση</TableHead>
          <TableHead className="hidden sm:table-cell">Ημ/νία Αποστολής</TableHead>
          <TableHead className="hidden lg:table-cell">Ημ/νία Ολοκλήρωσης</TableHead>
          <TableHead className="text-right">Ενέργειες</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={(e) => handleRowClick(request.id, e)}
          >
            {showCitizen && (
              <TableCell className="font-medium">
                {request.citizen ? (
                  <Link
                    href={`/dashboard/citizens/${request.citizen.id}`}
                    className="text-primary hover:underline"
                  >
                    {request.citizen.surname} {request.citizen.first_name}
                  </Link>
                ) : (
                  '-'
                )}
              </TableCell>
            )}
            <TableCell>
              {getLabel(REQUEST_CATEGORY_OPTIONS, request.category)}
            </TableCell>
            <TableCell>
              <RequestBadge status={request.status} />
            </TableCell>
            <TableCell className="hidden sm:table-cell">{formatDate(request.submitted_at)}</TableCell>
            <TableCell className="hidden lg:table-cell">{formatDate(request.completed_at)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/requests/${request.id}`}>
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
