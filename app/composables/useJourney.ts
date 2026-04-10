import type { JourneyType } from '~/types/database'

/**
 * Composable for care plan / journey operations — generate, transition, complete events.
 */
export function useJourney() {
  const supabase = useSupabaseClient()
  const journeyStore = useJourneyStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Generate a care plan from a template */
  async function generateCarePlan(input: {
    familyId: string
    type: JourneyType
    lmpDate?: string
    dob?: string
    templateId?: string
  }) {
    loading.value = true
    error.value = null

    try {
      // Create journey record
      const { data: journey, error: journeyError } = await supabase
        .from('journeys')
        .insert({
          family_id: input.familyId,
          template_id: input.templateId || null,
          type: input.type,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (journeyError || !journey) {
        error.value = journeyError?.message || 'Failed to create journey'
        return null
      }

      // Generate events based on type
      const events = buildEventsForJourney(input.type, journey.id, input.lmpDate, input.dob)

      if (events.length > 0) {
        const { error: eventsError } = await supabase
          .from('journey_events')
          .insert(events as any)

        if (eventsError) {
          error.value = eventsError.message
          return null
        }
      }

      // Refresh store
      await journeyStore.fetchJourneys(input.familyId)
      return journey
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Transition from pregnancy to postpartum + infant journeys */
  async function transitionToPostpartum(input: {
    familyId: string
    pregnancyJourneyId: string
    childData: {
      name: string
      dob: string
      gender: 'male' | 'female'
      birth_weight?: number
      birth_height?: number
      apgar_1min?: number
      apgar_5min?: number
    }
  }) {
    loading.value = true
    error.value = null

    try {
      // 1. Close pregnancy journey
      await supabase
        .from('journeys')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', input.pregnancyJourneyId)

      // 2. Create child profile
      const { data: child, error: childError } = await supabase
        .from('child_profiles')
        .insert({
          family_id: input.familyId,
          name: input.childData.name,
          dob: input.childData.dob,
          gender: input.childData.gender,
          birth_weight: input.childData.birth_weight,
          birth_height: input.childData.birth_height,
          apgar_1min: input.childData.apgar_1min,
          apgar_5min: input.childData.apgar_5min,
        })
        .select()
        .single()

      if (childError || !child) {
        error.value = childError?.message || 'Failed to create child profile'
        return null
      }

      // 3. Create postpartum journey
      await generateCarePlan({
        familyId: input.familyId,
        type: 'postpartum',
      })

      // 4. Create infant journey
      await generateCarePlan({
        familyId: input.familyId,
        type: 'infant',
        dob: input.childData.dob,
      })

      // 5. Generate vaccinations from national calendar
      await generateVaccinations(child.id, input.childData.dob)

      return { child, success: true }
    }
    catch (e: unknown) {
      error.value = (e as Error).message
      return null
    }
    finally {
      loading.value = false
    }
  }

  /** Complete a journey event */
  async function completeEvent(eventId: string, notes?: string) {
    return journeyStore.completeEvent(eventId, notes as string | undefined)
  }

  /** Skip a journey event */
  async function skipEvent(eventId: string, reason?: string) {
    return journeyStore.skipEvent(eventId, reason)
  }

  return {
    loading,
    error,
    generateCarePlan,
    transitionToPostpartum,
    completeEvent,
    skipEvent,
  }
}

// --- Internal helpers ---

import { PREGNANCY_EVENTS_KZ, KZ_VACCINATION_CALENDAR } from '~/utils/constants'
import dayjs from 'dayjs'

function buildEventsForJourney(
  type: JourneyType,
  journeyId: string,
  lmpDate?: string,
  dob?: string,
): Array<Record<string, unknown>> {
  const events: Array<Record<string, unknown>> = []

  if (type === 'pregnancy' && lmpDate) {
    const lmp = dayjs(lmpDate)
    for (const evt of PREGNANCY_EVENTS_KZ) {
      const dueDate = lmp.add(evt.week * 7, 'day')
      events.push({
        journey_id: journeyId,
        type: evt.type,
        title: evt.title,
        trigger_week: evt.week,
        due_date: dueDate.format('YYYY-MM-DD'),
        status: 'upcoming',
        is_mandatory: evt.mandatory,
      })
    }
  }
  else if ((type === 'infant' || type === 'toddler') && dob) {
    const birthDate = dayjs(dob)
    // Well-child visits at standard intervals
    const checkups = [
      { day: 30, title: 'Осмотр в 1 месяц' },
      { day: 60, title: 'Осмотр в 2 месяца' },
      { day: 90, title: 'Осмотр в 3 месяца' },
      { day: 180, title: 'Осмотр в 6 месяцев' },
      { day: 270, title: 'Осмотр в 9 месяцев' },
      { day: 365, title: 'Осмотр в 12 месяцев' },
      { day: 548, title: 'Осмотр в 18 месяцев' },
      { day: 730, title: 'Осмотр в 24 месяца' },
    ]

    for (const c of checkups) {
      if (type === 'infant' && c.day > 365) continue
      if (type === 'toddler' && c.day <= 365) continue

      events.push({
        journey_id: journeyId,
        type: 'checkup',
        title: c.title,
        trigger_day: c.day,
        due_date: birthDate.add(c.day, 'day').format('YYYY-MM-DD'),
        status: 'upcoming',
        is_mandatory: true,
      })
    }
  }
  else if (type === 'postpartum') {
    // Postpartum checkups (mother-focused)
    const postpartumEvents = [
      { day: 3, title: 'Патронажный визит (3 дня)' },
      { day: 7, title: 'Патронажный визит (неделя)' },
      { day: 14, title: 'Послеродовой осмотр (2 нед)' },
      { day: 42, title: 'Осмотр гинеколога (6 нед)' },
    ]

    for (const evt of postpartumEvents) {
      events.push({
        journey_id: journeyId,
        type: 'checkup',
        title: evt.title,
        trigger_day: evt.day,
        due_date: dayjs().add(evt.day, 'day').format('YYYY-MM-DD'),
        status: 'upcoming',
        is_mandatory: true,
      })
    }
  }

  return events
}

async function generateVaccinations(childId: string, dob: string) {
  const supabase = useSupabaseClient()
  const birthDate = dayjs(dob)

  const vaccinations = KZ_VACCINATION_CALENDAR.map(v => ({
    child_id: childId,
    vaccine_name: v.vaccine,
    dose_number: 1,
    scheduled_date: birthDate.add(v.trigger_day, 'day').format('YYYY-MM-DD'),
    status: 'scheduled' as const,
  }))

  await supabase.from('vaccinations').insert(vaccinations)
}
