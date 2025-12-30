'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface UsePaginationOptions {
  itemsPerPage?: number
  paramName?: string
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  totalItems: number
  paginatedItems: T[]
  setPage: (page: number) => void
  itemsPerPage: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage = 20, paramName = 'page' } = options

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Get current page from URL params
  const currentPage = useMemo(() => {
    const pageParam = searchParams.get(paramName)
    const page = pageParam ? parseInt(pageParam, 10) : 1
    return isNaN(page) || page < 1 ? 1 : page
  }, [searchParams, paramName])

  // Calculate total pages
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Ensure current page is valid
  const validPage = Math.min(currentPage, totalPages)

  // Get paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (validPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, validPage, itemsPerPage])

  // Set page and update URL
  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (page <= 1) {
      params.delete(paramName)
    } else {
      params.set(paramName, page.toString())
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.push(newUrl, { scroll: false })
  }, [searchParams, pathname, router, paramName])

  return {
    currentPage: validPage,
    totalPages,
    totalItems,
    paginatedItems,
    setPage,
    itemsPerPage
  }
}
