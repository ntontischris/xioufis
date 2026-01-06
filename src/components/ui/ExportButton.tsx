'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { exportToExcel, ExcelColumn, ExcelExportOptions } from '@/lib/utils/excel-export'
import { toast } from 'sonner'

interface ExportButtonProps<T> {
  data: T[]
  columns: ExcelColumn<T>[]
  options?: ExcelExportOptions
  disabled?: boolean
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  label?: string
}

export function ExportButton<T>({
  data,
  columns,
  options = {},
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
  label = 'Εξαγωγή Excel',
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (data.length === 0) {
      toast.error('Δεν υπάρχουν δεδομένα για εξαγωγή')
      return
    }

    setIsExporting(true)

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100))

      exportToExcel(data, columns, options)

      toast.success(`Εξήχθησαν ${data.length} εγγραφές επιτυχώς`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Σφάλμα κατά την εξαγωγή')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting || data.length === 0}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Excel</span>
    </Button>
  )
}
