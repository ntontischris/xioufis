import * as XLSX from 'xlsx'

/**
 * Column configuration for Excel export
 */
export interface ExcelColumn<T> {
  header: string // Greek header name
  key: keyof T | ((item: T) => string | number | boolean | null | undefined)
  width?: number // Column width in characters
}

/**
 * Options for Excel export
 */
export interface ExcelExportOptions {
  sheetName?: string
  fileName?: string
  headerStyle?: boolean
}

/**
 * Format a date value for Excel display
 */
export function formatDateForExcel(date: string | null | undefined): string {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '-'
  }
}

/**
 * Format a boolean value for Excel display
 */
export function formatBooleanForExcel(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return value ? 'Ναι' : 'Όχι'
}

/**
 * Get cell value from an item using column configuration
 */
function getCellValue<T>(item: T, column: ExcelColumn<T>): string | number {
  let value: unknown

  if (typeof column.key === 'function') {
    value = column.key(item)
  } else {
    value = item[column.key]
  }

  // Handle different value types
  if (value === null || value === undefined) {
    return '-'
  }
  if (typeof value === 'boolean') {
    return value ? 'Ναι' : 'Όχι'
  }
  if (typeof value === 'number') {
    return value
  }
  return String(value)
}

/**
 * Export data to Excel file with proper Greek character support
 * Uses styled headers and auto-adjusted column widths
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExcelColumn<T>[],
  options: ExcelExportOptions = {}
): void {
  const {
    sheetName = 'Δεδομένα',
    fileName = 'export',
  } = options

  // Create worksheet data array
  const wsData: (string | number)[][] = []

  // Add header row
  const headers = columns.map(col => col.header)
  wsData.push(headers)

  // Add data rows
  for (const item of data) {
    const row = columns.map(col => getCellValue(item, col))
    wsData.push(row)
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  const colWidths = columns.map(col => ({
    wch: col.width || Math.max(
      col.header.length + 2,
      15 // minimum width
    )
  }))
  ws['!cols'] = colWidths

  // Style header row (set first row to bold via cell formatting)
  // Note: xlsx community version has limited styling, but we can set the header row
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

  // Make headers stand out by converting them to uppercase (visual emphasis)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (ws[cellRef]) {
      // Keep the header as-is but ensure it's a string type
      ws[cellRef].t = 's'
    }
  }

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const fullFileName = `${fileName}_${timestamp}.xlsx`

  // Write file with proper encoding for Greek characters
  // The xlsx library handles UTF-8 encoding internally for .xlsx format
  XLSX.writeFile(wb, fullFileName, {
    bookType: 'xlsx',
    type: 'binary',
  })
}

/**
 * Create a download blob for Excel file (for custom download handling)
 */
export function createExcelBlob<T>(
  data: T[],
  columns: ExcelColumn<T>[],
  sheetName = 'Δεδομένα'
): Blob {
  // Create worksheet data array
  const wsData: (string | number)[][] = []

  // Add header row
  const headers = columns.map(col => col.header)
  wsData.push(headers)

  // Add data rows
  for (const item of data) {
    const row = columns.map(col => getCellValue(item, col))
    wsData.push(row)
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Set column widths
  const colWidths = columns.map(col => ({
    wch: col.width || Math.max(col.header.length + 2, 15)
  }))
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  // Generate binary string
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  return new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
