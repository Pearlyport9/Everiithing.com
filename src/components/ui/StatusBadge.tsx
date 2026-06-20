import type { BookingStatus, VerificationStatus, PaymentStatus } from '@/types'
import { Badge } from './Badge'

interface StatusBadgeProps {
  status: BookingStatus | VerificationStatus | PaymentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
    pending: { label: 'Pending', variant: 'warning' },
    pending_quote: { label: 'Awaiting Quote', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    provider_assigned: { label: 'Provider Assigned', variant: 'info' },
    in_progress: { label: 'In Progress', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    disputed: { label: 'Disputed', variant: 'error' },
    cancelled: { label: 'Cancelled', variant: 'default' },
    refunded: { label: 'Refunded', variant: 'default' },
    under_review: { label: 'Under Review', variant: 'warning' },
    interview_scheduled: { label: 'Interview Scheduled', variant: 'info' },
    skills_test: { label: 'Skills Test', variant: 'info' },
    approved: { label: 'Approved', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'error' },
    suspended: { label: 'Suspended', variant: 'error' },
    unpaid: { label: 'Unpaid', variant: 'error' },
    paid: { label: 'Paid', variant: 'info' },
    in_escrow: { label: 'In Escrow', variant: 'warning' },
    released: { label: 'Released', variant: 'success' },
  }

  const config = map[status] || { label: status, variant: 'default' as const }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
