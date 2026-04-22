// GET /api/chief/case-reviews/[id]/snapshot
// Builds (and optionally persists) the frozen case packet — appointment
// record, prescriptions around it, notes, timeline, related deviations
// and complaints. Called when chief opens a case for the first time.
import { requireChief } from '~~/server/utils/chief-guard'

export default defineEventHandler(async (event) => {
  const { supabase, clinicId } = await requireChief(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'case-review id required' })

  const { data: cr, error } = await supabase
    .from('case_reviews')
    .select('*')
    .eq('id', id)
    .eq('clinic_id', clinicId)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  if (!cr) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // If already has snapshot, return as-is.
  if (cr.snapshot_json) return { case_review: cr }

  // Build snapshot
  const snapshot: Record<string, unknown> = {}

  if (cr.appointment_id) {
    const { data: appt } = await supabase
      .from('appointments')
      .select(`
        id, appointment_date, start_time, end_time, status, reason,
        icd10_primary, icd10_secondary, completion_checklist, post_visit_notes, notes,
        doctor:doctors!doctor_id (
          id, specialty,
          user:users!user_id ( first_name, last_name )
        ),
        family:families!family_id (
          id,
          primary_parent:users!families_primary_parent_id_fkey ( first_name, last_name, phone )
        ),
        child:child_profiles!child_id ( id, name, dob, gender )
      `)
      .eq('id', cr.appointment_id)
      .maybeSingle()
    snapshot.appointment = appt ?? null

    // Prescriptions tied to this appointment OR created within 7 days of it
    if (appt) {
      const { data: rx } = await supabase
        .from('prescriptions')
        .select('id, medication, inn_name, dose_value, dose_unit, route, dosage, frequency, icd10_indication, start_date, end_date, is_active, instructions')
        .eq('family_id', (appt as any).family?.id ?? cr.family_id)
        .order('start_date', { ascending: false })
        .limit(20)
      snapshot.prescriptions = rx ?? []
    }
  }

  // Deviations on the same appointment
  if (cr.appointment_id) {
    const { data: devs } = await supabase
      .from('protocol_deviations')
      .select('id, kind, severity, details, justified, justification_note, detected_at')
      .eq('appointment_id', cr.appointment_id)
    snapshot.deviations = devs ?? []
  }

  // Related complaints
  if (cr.family_id) {
    const { data: comps } = await supabase
      .from('complaints')
      .select('id, kind, severity, body, status, created_at')
      .eq('family_id', cr.family_id)
      .order('created_at', { ascending: false })
      .limit(10)
    snapshot.complaints = comps ?? []
  }

  // Rx alerts tied to doctor or family
  if (cr.doctor_id) {
    const { data: alerts } = await supabase
      .from('prescription_alerts')
      .select('id, kind, severity, message, status, created_at')
      .eq('doctor_id', cr.doctor_id)
      .order('created_at', { ascending: false })
      .limit(10)
    snapshot.rx_alerts = alerts ?? []
  }

  // Persist for forensic durability
  const { data: updated } = await supabase
    .from('case_reviews')
    .update({ snapshot_json: snapshot })
    .eq('id', id)
    .select()
    .single()

  return { case_review: updated ?? cr, snapshot_generated: true }
})
