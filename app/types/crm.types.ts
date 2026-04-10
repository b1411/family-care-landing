// CRM System Types — manually defined for new CRM tables
// These types supplement the auto-generated database.types.ts

export interface Lead {
  id: string
  clinic_id: string
  source: 'website' | 'instagram' | '2gis' | 'referral' | 'walk_in' | 'phone' | 'whatsapp' | 'other'
  stage: 'new' | 'contacted' | 'interested' | 'negotiation' | 'won' | 'lost'
  first_name: string
  last_name: string | null
  phone: string | null
  email: string | null
  lmp_date: string | null
  edd_date: string | null
  assigned_to: string | null
  lost_reason: string | null
  notes: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  family_id: string | null
  converted_at: string | null
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: string
  lead_id: string
  type: 'call' | 'whatsapp' | 'sms' | 'email' | 'note' | 'meeting' | 'demo' | 'status_change'
  direction: 'inbound' | 'outbound' | null
  summary: string | null
  duration_seconds: number | null
  performed_by: string | null
  created_at: string
}

export interface FamilyActivity {
  id: string
  family_id: string
  clinic_id: string
  type:
    | 'call' | 'whatsapp' | 'sms' | 'email' | 'note'
    | 'appointment_created' | 'appointment_completed' | 'appointment_cancelled'
    | 'task_created' | 'task_completed'
    | 'prescription_created' | 'document_uploaded'
    | 'journey_started' | 'journey_completed'
    | 'dose_missed' | 'status_change' | 'package_purchased'
  summary: string
  detail_json: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

export interface FamilyNote {
  id: string
  family_id: string
  author_id: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  // Joined fields
  author?: { first_name: string; last_name: string }
}

export interface Segment {
  id: string
  clinic_id: string
  name: string
  description: string | null
  criteria_json: SegmentCriteria
  is_dynamic: boolean
  family_count: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SegmentCriteria {
  conditions: SegmentCondition[]
  logic: 'and' | 'or'
}

export interface SegmentCondition {
  field: string
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'between'
  value: string | number | boolean | string[] | number[]
}

export interface MessageTemplate {
  id: string
  clinic_id: string
  name: string
  channel: 'whatsapp' | 'push' | 'sms' | 'email'
  subject: string | null
  body: string
  variables: string[]
  language: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  clinic_id: string
  name: string
  type: 'drip' | 'one_time' | 'recurring'
  segment_id: string | null
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  steps_json: CampaignStep[]
  ab_test_config: Record<string, unknown> | null
  stats_json: CampaignStats
  created_by: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignStep {
  day: number
  channel: 'whatsapp' | 'push' | 'sms' | 'email'
  template_id?: string
  template_name?: string
  message?: string
  condition: string | null
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  converted: number
}

export interface CampaignEnrollment {
  id: string
  campaign_id: string
  family_id: string
  current_step: number
  status: 'active' | 'completed' | 'cancelled' | 'converted'
  enrolled_at: string
  last_step_sent_at: string | null
  converted_at: string | null
}

export interface CallScript {
  id: string
  clinic_id: string
  task_type: string
  name: string
  steps_json: CallScriptStep[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CallScriptStep {
  id: string
  question: string
  options: { label: string; next_step: string | null; outcome?: string }[]
}

export interface CallLog {
  id: string
  clinic_id: string
  family_id: string | null
  lead_id: string | null
  caller_id: string
  direction: 'inbound' | 'outbound'
  duration_seconds: number
  outcome: 'answered' | 'no_answer' | 'busy' | 'voicemail' | 'callback_requested' | 'wrong_number'
  script_id: string | null
  script_answers_json: Record<string, unknown> | null
  notes: string | null
  created_at: string
}

export interface Deal {
  id: string
  clinic_id: string
  family_id: string | null
  lead_id: string | null
  package_id: string | null
  amount: number | null
  stage: 'proposed' | 'negotiation' | 'approved' | 'paid' | 'cancelled'
  proposed_by: string | null
  proposed_at: string
  closed_at: string | null
  payment_method: string | null
  invoice_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// View types
export interface LeadFunnelRow {
  clinic_id: string
  source: string
  total_leads: number
  stage_new: number
  stage_contacted: number
  stage_interested: number
  stage_negotiation: number
  stage_won: number
  stage_lost: number
  conversion_pct: number | null
  avg_days_to_convert: number | null
}

export interface CoordinatorPerformanceRow {
  coordinator_id: string
  first_name: string
  last_name: string
  clinic_id: string
  active_families: number
  pending_tasks: number
  completed_this_month: number
  sla_breaches_this_month: number
  sla_compliance_pct: number | null
  avg_response_minutes: number | null
}

export interface CampaignPerformanceRow {
  campaign_id: string
  clinic_id: string
  name: string
  type: string
  status: string
  total_enrolled: number
  active_enrollments: number
  completed_enrollments: number
  converted_enrollments: number
  conversion_pct: number | null
  started_at: string | null
  created_at: string
}

// Lead stage display helpers
export const LEAD_STAGES = ['new', 'contacted', 'interested', 'negotiation', 'won', 'lost'] as const
export type LeadStage = typeof LEAD_STAGES[number]

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new: 'Новый',
  contacted: 'Контакт',
  interested: 'Интерес',
  negotiation: 'Переговоры',
  won: 'Конвертирован',
  lost: 'Потерян',
}

export const LEAD_STAGE_COLORS: Record<LeadStage, string> = {
  new: '#8B7EC8',
  contacted: '#7CB8D4',
  interested: '#E9C46A',
  negotiation: '#E8A0BF',
  won: '#4CAF50',
  lost: '#EF5350',
}

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: 'Сайт',
  instagram: 'Instagram',
  '2gis': '2GIS',
  referral: 'Рекомендация',
  walk_in: 'Визит в клинику',
  phone: 'Звонок',
  whatsapp: 'WhatsApp',
  other: 'Другое',
}

export const DEAL_STAGES = ['proposed', 'negotiation', 'approved', 'paid', 'cancelled'] as const
export type DealStage = typeof DEAL_STAGES[number]

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  proposed: 'Предложено',
  negotiation: 'Переговоры',
  approved: 'Одобрено',
  paid: 'Оплачено',
  cancelled: 'Отменено',
}
