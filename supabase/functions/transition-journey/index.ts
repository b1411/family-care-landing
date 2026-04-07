import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createSupabaseAdmin, jsonResponse, errorResponse, corsHeaders } from '../_shared/supabase.ts'

/**
 * transition-journey
 *
 * Handles the pregnancy → postpartum + infant transition after birth.
 *
 * Input: {
 *   family_id,
 *   birth_date,        // ISO date string
 *   child_name,
 *   gender,            // 'male' | 'female'
 *   birth_weight,      // kg (e.g. 3.45)
 *   birth_height,      // cm (e.g. 51)
 *   apgar_1min,
 *   apgar_5min,
 *   blood_type?,
 *   coordinator_id?    // who is registering the birth
 * }
 *
 * Actions:
 * 1. Complete the active pregnancy journey
 * 2. Create child_profile
 * 3. Create postpartum journey (for mother) — calls generate-care-plan internally
 * 4. Create infant journey (for child) — calls generate-care-plan internally
 * 5. Generate vaccinations from KZ national calendar
 * 6. Create default prescriptions (Vitamin D3)
 * 7. Send notification to mother
 */

// KZ national vaccination calendar
const KZ_VACCINATIONS = [
  { vaccine: 'БЦЖ', dose: 1, trigger_day: 1 },
  { vaccine: 'Гепатит B (1-я)', dose: 1, trigger_day: 1 },
  { vaccine: 'АКДС-ГепВ-Хиб (1-я)', dose: 1, trigger_day: 60 },
  { vaccine: 'ИПВ (1-я)', dose: 1, trigger_day: 60 },
  { vaccine: 'Пневмококк PCV13 (1-я)', dose: 1, trigger_day: 60 },
  { vaccine: 'Гепатит B (2-я)', dose: 2, trigger_day: 60 },
  { vaccine: 'АКДС-ГепВ-Хиб (2-я)', dose: 2, trigger_day: 90 },
  { vaccine: 'ИПВ (2-я)', dose: 2, trigger_day: 90 },
  { vaccine: 'Пневмококк PCV13 (2-я)', dose: 2, trigger_day: 90 },
  { vaccine: 'АКДС-ГепВ-Хиб (3-я)', dose: 3, trigger_day: 120 },
  { vaccine: 'ИПВ (3-я)', dose: 3, trigger_day: 120 },
  { vaccine: 'КПК (1-я)', dose: 1, trigger_day: 365 },
  { vaccine: 'Пневмококк PCV13 (3-я)', dose: 3, trigger_day: 365 },
  { vaccine: 'АКДС (ревакцинация)', dose: 4, trigger_day: 547 },
  { vaccine: 'ОПВ (ревакцинация)', dose: 4, trigger_day: 547 },
]

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabase = createSupabaseAdmin()
    const body = await req.json()

    const {
      family_id,
      birth_date,
      child_name,
      gender,
      birth_weight,
      birth_height,
      apgar_1min,
      apgar_5min,
      blood_type,
    } = body

    if (!family_id || !birth_date || !child_name || !gender) {
      return errorResponse('Missing required fields: family_id, birth_date, child_name, gender')
    }

    // 1. Complete pregnancy journey
    const { data: pregnancyJourney } = await supabase
      .from('journeys')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('family_id', family_id)
      .eq('type', 'pregnancy')
      .eq('status', 'active')
      .select('id')
      .maybeSingle()

    // Cancel remaining upcoming/due events from pregnancy
    if (pregnancyJourney) {
      await supabase
        .from('journey_events')
        .update({ status: 'cancelled' })
        .eq('journey_id', pregnancyJourney.id)
        .in('status', ['upcoming', 'due'])
    }

    // 2. Create child profile
    const { data: child, error: childError } = await supabase
      .from('child_profiles')
      .insert({
        family_id,
        name: child_name,
        dob: birth_date,
        gender,
        birth_weight: birth_weight || null,
        birth_height: birth_height || null,
        apgar_1min: apgar_1min || null,
        apgar_5min: apgar_5min || null,
        blood_type: blood_type || null,
        allergies: [],
      })
      .select()
      .single()

    if (childError) {
      return errorResponse(`Failed to create child profile: ${childError.message}`, 500)
    }

    // 3. Get clinic_id from family
    const { data: family } = await supabase
      .from('families')
      .select('clinic_id')
      .eq('id', family_id)
      .single()

    if (!family) return errorResponse('Family not found', 404)

    // 4. Create postpartum journey
    const postpartumTemplate = await supabase
      .from('journey_templates')
      .select('id')
      .eq('clinic_id', family.clinic_id)
      .eq('type', 'postpartum')
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle()

    let postpartumJourneyId: string | null = null

    if (postpartumTemplate.data) {
      // Call generate-care-plan logic inline
      const { data: ppJourney } = await supabase
        .from('journeys')
        .insert({
          family_id,
          template_id: postpartumTemplate.data.id,
          type: 'postpartum',
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (ppJourney) {
        postpartumJourneyId = ppJourney.id
        // Generate events from postpartum template
        const { data: template } = await supabase
          .from('journey_templates')
          .select('events_json')
          .eq('id', postpartumTemplate.data.id)
          .single()

        if (template) {
          const refDate = new Date(birth_date)
          const events = (template.events_json as Array<{
            type: string; title: string; description?: string;
            trigger_day?: number; is_mandatory: boolean
          }>).map((evt) => {
            const dueDate = new Date(refDate)
            dueDate.setDate(dueDate.getDate() + (evt.trigger_day || 30))
            return {
              journey_id: ppJourney.id,
              type: evt.type,
              title: evt.title,
              description: evt.description || null,
              trigger_day: evt.trigger_day || null,
              due_date: dueDate.toISOString().split('T')[0],
              status: dueDate <= new Date() ? 'due' : 'upcoming',
              is_mandatory: evt.is_mandatory,
            }
          })
          await supabase.from('journey_events').insert(events)
        }
      }
    }

    // 5. Create infant journey
    const infantTemplate = await supabase
      .from('journey_templates')
      .select('id')
      .eq('clinic_id', family.clinic_id)
      .eq('type', 'infant')
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle()

    let infantJourneyId: string | null = null

    if (infantTemplate.data) {
      const { data: infJourney } = await supabase
        .from('journeys')
        .insert({
          family_id,
          template_id: infantTemplate.data.id,
          child_id: child.id,
          type: 'infant',
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (infJourney) {
        infantJourneyId = infJourney.id
        const { data: template } = await supabase
          .from('journey_templates')
          .select('events_json')
          .eq('id', infantTemplate.data.id)
          .single()

        if (template) {
          const refDate = new Date(birth_date)
          const events = (template.events_json as Array<{
            type: string; title: string; description?: string;
            trigger_day?: number; is_mandatory: boolean
          }>).map((evt) => {
            const dueDate = new Date(refDate)
            dueDate.setDate(dueDate.getDate() + (evt.trigger_day || 30))
            return {
              journey_id: infJourney.id,
              type: evt.type,
              title: evt.title,
              description: evt.description || null,
              trigger_day: evt.trigger_day || null,
              due_date: dueDate.toISOString().split('T')[0],
              status: dueDate <= new Date() ? 'due' : 'upcoming',
              is_mandatory: evt.is_mandatory,
            }
          })
          await supabase.from('journey_events').insert(events)
        }
      }
    }

    // 6. Generate vaccinations from KZ national calendar
    const dob = new Date(birth_date)
    const vaccinations = KZ_VACCINATIONS.map((v) => {
      const scheduledDate = new Date(dob)
      scheduledDate.setDate(scheduledDate.getDate() + v.trigger_day)
      return {
        child_id: child.id,
        vaccine_name: v.vaccine,
        dose_number: v.dose,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        status: 'scheduled',
      }
    })

    await supabase.from('vaccinations').insert(vaccinations)

    // 7. Create default prescription: Vitamin D3
    await supabase.from('prescriptions').insert({
      family_id,
      child_id: child.id,
      medication: 'Витамин D3 (Аквадетрим)',
      dosage: '500 МЕ (1 капля)',
      frequency: 'daily',
      time_of_day: ['morning'],
      start_date: birth_date,
      is_active: true,
    })

    // 8. Create welcome notification for mother
    const { data: motherUser } = await supabase
      .from('families')
      .select('primary_parent_id')
      .eq('id', family_id)
      .single()

    if (motherUser) {
      await supabase.from('notifications').insert({
        user_id: motherUser.primary_parent_id,
        type: 'birth_registered',
        channel: 'in_app',
        title: `Поздравляем с рождением ${child_name}! 🎉`,
        body: 'Маршрут здоровья малыша создан. Откройте приложение, чтобы увидеть план.',
        status: 'pending',
      })
    }

    return jsonResponse({
      success: true,
      child_id: child.id,
      postpartum_journey_id: postpartumJourneyId,
      infant_journey_id: infantJourneyId,
      vaccinations_created: vaccinations.length,
    })
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500)
  }
})
