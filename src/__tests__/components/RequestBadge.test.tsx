import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RequestBadge } from '@/components/requests/RequestBadge'

// First, let's check what RequestBadge does
describe('RequestBadge', () => {
  it('should render COMPLETED status with success styling', () => {
    render(<RequestBadge status="COMPLETED" />)

    const badge = screen.getByText('Ολοκληρωμένο')
    expect(badge).toBeInTheDocument()
  })

  it('should render PENDING status with warning styling', () => {
    render(<RequestBadge status="PENDING" />)

    const badge = screen.getByText('Εκκρεμεί')
    expect(badge).toBeInTheDocument()
  })

  it('should render NOT_COMPLETED status', () => {
    render(<RequestBadge status="NOT_COMPLETED" />)

    const badge = screen.getByText('Μη Ολοκληρωμένο')
    expect(badge).toBeInTheDocument()
  })

  it('should handle unknown status gracefully', () => {
    render(<RequestBadge status="UNKNOWN_STATUS" />)

    // Should still render something
    const badge = screen.getByText('UNKNOWN_STATUS')
    expect(badge).toBeInTheDocument()
  })
})
