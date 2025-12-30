import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock for URL-based pagination hook
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/dashboard/citizens',
  useSearchParams: () => mockSearchParams,
}))

// Import after mocking
import { usePagination } from '@/lib/hooks/usePagination'

describe('usePagination', () => {
  const mockItems = Array.from({ length: 45 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
  }))

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset search params
    mockSearchParams.delete('page')
  })

  describe('basic pagination', () => {
    it('should return first page of items by default', () => {
      const { result } = renderHook(() => usePagination(mockItems, { itemsPerPage: 10 }))

      expect(result.current.currentPage).toBe(1)
      expect(result.current.paginatedItems).toHaveLength(10)
      expect(result.current.paginatedItems[0].id).toBe('item-1')
      expect(result.current.paginatedItems[9].id).toBe('item-10')
    })

    it('should calculate total pages correctly', () => {
      const { result } = renderHook(() => usePagination(mockItems, { itemsPerPage: 10 }))

      expect(result.current.totalPages).toBe(5) // 45 items / 10 per page = 5 pages
      expect(result.current.totalItems).toBe(45)
    })

    it('should return correct itemsPerPage', () => {
      const { result } = renderHook(() => usePagination(mockItems, { itemsPerPage: 15 }))

      expect(result.current.itemsPerPage).toBe(15)
      expect(result.current.paginatedItems).toHaveLength(15)
    })

    it('should use default itemsPerPage of 20', () => {
      const { result } = renderHook(() => usePagination(mockItems))

      expect(result.current.itemsPerPage).toBe(20)
    })
  })

  describe('page navigation', () => {
    it('should call router.push when setPage is called', () => {
      const { result } = renderHook(() => usePagination(mockItems, { itemsPerPage: 10 }))

      act(() => {
        result.current.setPage(2)
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/citizens?page=2', { scroll: false })
    })

    it('should remove page param when going to page 1', () => {
      const { result } = renderHook(() => usePagination(mockItems, { itemsPerPage: 10 }))

      act(() => {
        result.current.setPage(1)
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/citizens', { scroll: false })
    })

    it('should handle custom paramName', () => {
      const { result } = renderHook(() =>
        usePagination(mockItems, { itemsPerPage: 10, paramName: 'p' })
      )

      act(() => {
        result.current.setPage(3)
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/citizens?p=3', { scroll: false })
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const { result } = renderHook(() => usePagination([], { itemsPerPage: 10 }))

      expect(result.current.totalPages).toBe(1) // Minimum 1 page
      expect(result.current.paginatedItems).toHaveLength(0)
      expect(result.current.totalItems).toBe(0)
    })

    it('should handle single item', () => {
      const { result } = renderHook(() => usePagination([{ id: '1' }], { itemsPerPage: 10 }))

      expect(result.current.totalPages).toBe(1)
      expect(result.current.paginatedItems).toHaveLength(1)
    })

    it('should handle exact page boundary', () => {
      const exactItems = Array.from({ length: 20 }, (_, i) => ({ id: `item-${i + 1}` }))
      const { result } = renderHook(() => usePagination(exactItems, { itemsPerPage: 10 }))

      expect(result.current.totalPages).toBe(2)
      expect(result.current.paginatedItems).toHaveLength(10)
    })

    it('should clamp currentPage to valid range', () => {
      const fewItems = [{ id: '1' }, { id: '2' }]
      const { result } = renderHook(() => usePagination(fewItems, { itemsPerPage: 10 }))

      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalPages).toBe(1)
    })
  })

  describe('items update', () => {
    it('should update when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePagination(items, { itemsPerPage: 10 }),
        { initialProps: { items: mockItems } }
      )

      expect(result.current.totalItems).toBe(45)

      // Rerender with fewer items
      rerender({ items: mockItems.slice(0, 15) })

      expect(result.current.totalItems).toBe(15)
      expect(result.current.totalPages).toBe(2)
    })
  })
})

describe('useUnsavedChanges', () => {
  it('should be importable', async () => {
    const module = await import('@/lib/hooks/useUnsavedChanges')
    expect(module.useUnsavedChanges).toBeDefined()
  })
})
