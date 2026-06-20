export type UserRole = 'customer' | 'provider' | 'admin'

export type BookingStatus =
  | 'pending'
  | 'pending_quote'
  | 'confirmed'
  | 'provider_assigned'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled'
  | 'refunded'

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'interview_scheduled'
  | 'skills_test'
  | 'approved'
  | 'rejected'
  | 'suspended'

export type PaymentStatus =
  | 'unpaid'
  | 'paid'
  | 'in_escrow'
  | 'released'
  | 'refunded'

export interface Profile {
  id: string
  role: UserRole
  full_name?: string
  phone?: string
  email?: string
  avatar_url?: string
  lga?: string
  state?: string
  nin?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon_url?: string
  is_active?: boolean
  sort_order?: number
}

export interface Service {
  id: string
  category_id: string
  name: string
  description?: string
  base_price_ngn: number
  max_price_ngn?: number
  duration_hours?: number
  is_active?: boolean
}

export interface Provider {
  id: string
  bio?: string
  years_experience?: number
  verification_status: VerificationStatus
  verified_at?: string
  rating?: number
  total_jobs?: number
  total_earnings_ngn?: number
  available_balance?: number
  is_available?: boolean
  service_lgas?: string[]
  created_at: string
}

export interface Booking {
  id: string
  customer_id: string
  provider_id?: string
  service_id: string
  status: BookingStatus
  scheduled_date: string
  scheduled_time: string
  address: string
  lga: string
  notes?: string
  price_ngn: number
  platform_fee_ngn?: number
  provider_payout_ngn?: number
  payment_status: PaymentStatus
  flw_tx_ref?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  customer_id: string
  provider_id: string
  rating: number
  comment?: string
  created_at: string
}

export interface Dispute {
  id: string
  booking_id: string
  raised_by: string
  reason: string
  evidence_urls?: string[]
  status: 'open' | 'under_review' | 'resolved' | 'escalated'
  resolution?: string
  resolved_by?: string
  resolved_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title?: string
  body?: string
  is_read: boolean
  created_at: string
}

export interface VerificationPipeline {
  id: string
  provider_id: string
  stage:
    | 'documents'
    | 'identity'
    | 'references'
    | 'guarantor'
    | 'interview'
    | 'skills_test'
    | 'training'
  status: 'pending' | 'in_progress' | 'passed' | 'failed'
  notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface ProviderDocument {
  id: string
  provider_id: string
  doc_type:
    | 'nin'
    | 'id_card'
    | 'certificate'
    | 'guarantor_form'
    | 'reference_letter'
    | 'profile_photo'
  file_url: string
  verified: boolean
  uploaded_at: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
