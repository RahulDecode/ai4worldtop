// ============================================================
// AI4World – Core TypeScript Types
// ============================================================

export type UserRole = 'super_admin' | 'business_owner' | 'manager' | 'staff' | 'read_only'
export type BusinessVertical =
  | 'dental_clinic' | 'medical_clinic' | 'dermatology_clinic' | 'weight_loss_clinic'
  | 'diagnostic_lab' | 'salon' | 'barber_shop' | 'gym' | 'restaurant' | 'real_estate_agency'
export type LeadStatus =
  | 'new' | 'qualified' | 'appointment_booked' | 'attended'
  | 'converted' | 'no_response' | 'reactivated' | 'lost'
export type LeadSource = 'whatsapp' | 'website' | 'instagram' | 'facebook' | 'referral' | 'walk_in' | 'google' | 'other'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'rescheduled'
export type ConversationChannel = 'whatsapp' | 'sms' | 'email' | 'in_app'
export type MessageSender = 'customer' | 'ai' | 'staff' | 'system'
export type CampaignType = 'birthday' | 'anniversary' | 'reactivation' | 'promotion' | 'review_request' | 'referral' | 'membership_renewal'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type AIEmployeeType = 'front_desk' | 'lead_recovery' | 'customer_success' | 'crm_manager'
export type SubscriptionPlan = 'starter' | 'growth' | 'scale' | 'enterprise'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'paused'

// ---- Business ----
export interface Business {
  id: string
  name: string
  vertical: BusinessVertical
  phone?: string
  email?: string
  address?: string
  city?: string
  country: string
  timezone: string
  logo_url?: string
  website?: string
  whatsapp_number?: string
  meta_phone_id?: string
  settings: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

// ---- User ----
export interface User {
  id: string
  business_id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// ---- Customer ----
export interface Customer {
  id: string
  business_id: string
  full_name: string
  phone: string
  email?: string
  date_of_birth?: string
  anniversary?: string
  gender?: string
  address?: string
  tags: string[]
  lifetime_value: number
  visit_count: number
  last_visit_at?: string
  notes?: string
  source: LeadSource
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- Lead ----
export interface Lead {
  id: string
  business_id: string
  customer_id?: string
  full_name: string
  phone: string
  email?: string
  source: LeadSource
  status: LeadStatus
  score: number
  interest?: string
  notes?: string
  assigned_to?: string
  last_activity: string
  follow_up_at?: string
  converted_at?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- Appointment ----
export interface Appointment {
  id: string
  business_id: string
  customer_id?: string
  lead_id?: string
  title: string
  service?: string
  status: AppointmentStatus
  scheduled_at: string
  duration_mins: number
  staff_id?: string
  notes?: string
  reminder_sent: boolean
  no_show_follow_up_sent: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // joins
  customer?: Customer
  staff?: User
}

// ---- Conversation ----
export interface Conversation {
  id: string
  business_id: string
  customer_id?: string
  lead_id?: string
  channel: ConversationChannel
  phone: string
  ai_employee_type?: AIEmployeeType
  is_ai_active: boolean
  is_resolved: boolean
  assigned_to?: string
  last_message_at: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // joins
  customer?: Customer
  last_message?: Message
}

// ---- Message ----
export interface Message {
  id: string
  conversation_id: string
  business_id: string
  sender: MessageSender
  sender_id?: string
  content: string
  media_url?: string
  media_type?: string
  wa_message_id?: string
  is_read: boolean
  ai_intent?: string
  ai_confidence?: number
  created_at: string
}

// ---- Campaign ----
export interface Campaign {
  id: string
  business_id: string
  name: string
  type: CampaignType
  status: CampaignStatus
  template_name: string
  template_params: Record<string, unknown>
  target_segment: Record<string, unknown>
  scheduled_at?: string
  sent_count: number
  delivered_count: number
  read_count: number
  replied_count: number
  converted_count: number
  created_by?: string
  created_at: string
  updated_at: string
}

// ---- AI Employee ----
export interface AIEmployeeKPIs {
  conversations_handled: number
  appointments_booked: number
  leads_recovered: number
  revenue_recovered: number
  reviews_generated: number
  referrals_generated: number
}

export interface AIEmployee {
  id: string
  business_id: string
  type: AIEmployeeType
  name: string
  is_enabled: boolean
  system_prompt?: string
  config: Record<string, unknown>
  kpis: AIEmployeeKPIs
  escalation_rules: EscalationRule[]
  created_at: string
  updated_at: string
}

export interface EscalationRule {
  trigger: string
  action: 'notify_staff' | 'assign_to_human' | 'pause_ai'
  target_role?: UserRole
}

// ---- Subscription ----
export interface Subscription {
  id: string
  business_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  trial_ends_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

// ---- Analytics ----
export interface DashboardMetrics {
  leads_today: number
  appointments_booked_today: number
  revenue_recovered: number
  reviews_generated: number
  active_ai_employees: number
  leads_change_pct: number
  appointments_change_pct: number
}

export interface ConversionMetrics {
  lead_conversion_rate: number
  appointment_conversion_rate: number
  no_show_rate: number
  reactivation_rate: number
}

// ---- WhatsApp Webhook ----
export interface WAWebhookPayload {
  object: string
  entry: WAEntry[]
}

export interface WAEntry {
  id: string
  changes: WAChange[]
}

export interface WAChange {
  value: WAValue
  field: string
}

export interface WAValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: WAContact[]
  messages?: WAMessage[]
  statuses?: WAStatus[]
}

export interface WAContact {
  profile: { name: string }
  wa_id: string
}

export interface WAMessage {
  from: string
  id: string
  timestamp: string
  text?: { body: string }
  type: string
  image?: { id: string; mime_type: string }
  document?: { id: string; filename: string }
  interactive?: { type: string; button_reply?: { id: string; title: string } }
}

export interface WAStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
}

// ---- API Responses ----
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: {
    total?: number
    page?: number
    per_page?: number
  }
}

export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
