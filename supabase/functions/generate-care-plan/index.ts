import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createSupabaseAdmin, jsonResponse, errorResponse, corsHeaders } from '../_shared/supabase.ts'

/**
 * generate-care-plan
 *
 * Creates journey events from a journey template.
 * Input: { family_id, journey_type, reference_date, child_id?, template_id? }
 *
 * For pregnancy: reference_date = LMP date, events use trigger_week
 *   due_date = LMP + (trigger_week * 7) days
 *
 * For infant/toddler: reference_date = DOB, events use trigger_day
 *   due_date = DOB + trigger_day days
 *
 * For postpartum: reference_date = delivery date, events use trigger_day
 *   due_date = delivery_date + trigger_day days
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabase = createSupabaseAdmin()
    const body = await req.json()

    const { family_id, journey_type, reference_date, child_id, template_id } = body

    if (!family_id || !journey_type || !reference_date) {
      return errorResponse('Missing required fields: family_id, journey_type, reference_date')
    }

    // 1. Find the template
    let templateQuery = supabase
      .from('journey_templates')
      .select('*')
      .eq('type', journey_type)
      .eq('is_active', true)

    if (template_id) {
      templateQuery = templateQuery.eq('id', template_id)
    } else {
      // Get the clinic's default template, or fallback to any default
      const { data: family } = await supabase
        .from('families')
        .select('clinic_id')
        .eq('id', family_id)
        .single()

      if (!family) return errorResponse('Family not found', 404)

      templateQuery = templateQuery
        .eq('clinic_id', family.clinic_id)
        .eq('is_default', true)
    }

    const { data: template, error: templateError } = await templateQuery.single()

    if (templateError || !template) {
      return errorResponse(`Template not found for type: ${journey_type}`, 404)
    }

    // 2. Create the journey
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .insert({
        family_id,
        template_id: template.id,
        child_id: child_id || null,
        type: journey_type,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (journeyError) {
      return errorResponse(`Failed to create journey: ${journeyError.message}`, 500)
    }

    // 3. Generate events from template
    const refDate = new Date(reference_date)
    const events = (template.events_json as Array<{
      type: string
      title: string
      description?: string
      trigger_week?: number
      trigger_day?: number
      is_mandatory: boolean
    }>).map((evt) => {
      let dueDate: Date

      if (journey_type === 'pregnancy' && evt.trigger_week) {
        // Pregnancy: LMP + weeks
        dueDate = new Date(refDate)
        dueDate.setDate(dueDate.getDate() + evt.trigger_week * 7)
      } else if (evt.trigger_day !== undefined) {
        // Infant/toddler/postpartum: reference + days
        dueDate = new Date(refDate)
        dueDate.setDate(dueDate.getDate() + evt.trigger_day)
      } else {
        // Fallback: 30 days from now
        dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)
      }

      // Determine initial status based on due date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)

      let status: string
      if (dueDate < today) {
        status = 'overdue'
      } else if (dueDate.getTime() === today.getTime()) {
        status = 'due'
      } else {
        status = 'upcoming'
      }

      return {
        journey_id: journey.id,
        type: evt.type,
        title: evt.title,
        description: evt.description || null,
        trigger_week: evt.trigger_week || null,
        trigger_day: evt.trigger_day || null,
        due_date: dueDate.toISOString().split('T')[0],
        status,
        is_mandatory: evt.is_mandatory,
      }
    })

    // 4. Batch insert events
    const { data: insertedEvents, error: eventsError } = await supabase
      .from('journey_events')
      .insert(events)
      .select()

    if (eventsError) {
      return errorResponse(`Failed to create events: ${eventsError.message}`, 500)
    }

    return jsonResponse({
      journey_id: journey.id,
      events_created: insertedEvents?.length || 0,
      journey_type,
      reference_date,
    })
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500)
  }
})
