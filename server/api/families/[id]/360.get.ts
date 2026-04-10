// GET /api/families/[id]/360 — Full family context for 360° view
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Family ID required' })

  const client = await serverSupabaseClient(event)

  // Parallel fetches for all family data
  const [
    familyRes,
    journeysRes,
    childrenRes,
    prescriptionsRes,
    appointmentsRes,
    overdueTasksRes,
    notesRes,
  ] = await Promise.all([
    // Family + mother profile
    client.from('families').select(`
      id, status, created_at,
      parent:users!primary_parent_id ( id, first_name, last_name, phone, email, last_seen_at ),
      secondary:users!secondary_parent_id ( id, first_name, last_name, phone ),
      mother_profiles ( lmp_date, edd_date, blood_type, rh_factor, allergies, chronic_conditions, gravida, para )
    `).eq('id', id).single(),

    // Active journeys
    client.from('journeys').select(`
      id, type, status, started_at, completed_at, metadata,
      journey_events ( id, title, type, status, due_date, is_mandatory, completed_at )
    `).eq('family_id', id).order('started_at', { ascending: false }),

    // Children
    client.from('child_profiles').select('*').eq('family_id', id),

    // Active prescriptions with adherence
    client.from('prescriptions').select(`
      id, medication, dosage, frequency, start_date, end_date, is_active, time_of_day, instructions
    `).eq('family_id', id).eq('is_active', true),

    // Recent appointments (last 10)
    client.from('appointments').select(`
      id, appointment_date, start_time, status, reason,
      doctor:doctors!doctor_id ( user:users!user_id ( first_name, last_name ) )
    `).eq('family_id', id).order('appointment_date', { ascending: false }).limit(10),

    // Pending tasks
    client.from('coordinator_tasks').select('id, type, priority, title, status, created_at')
      .eq('family_id', id).eq('status', 'pending').order('created_at', { ascending: false }).limit(10),

    // Pinned & recent notes
    (client as any).from('family_notes').select(`
      id, content, is_pinned, created_at,
      author:users!author_id ( first_name, last_name )
    `).eq('family_id', id).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(20),
  ])

  if (familyRes.error) throw createError({ statusCode: 500, statusMessage: familyRes.error.message })

  const family = familyRes.data
  const parent = Array.isArray(family.parent) ? family.parent[0] : family.parent
  const secondary = Array.isArray(family.secondary) ? family.secondary[0] : family.secondary
  const mp = Array.isArray(family.mother_profiles) ? family.mother_profiles[0] : family.mother_profiles

  // Calculate adherence from dose_logs (last 30 days)
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const { data: doseLogs } = await client
    .from('dose_logs')
    .select('status')
    .eq('family_id', id)
    .gte('scheduled_at', since)
    .in('status', ['confirmed', 'missed'])

  let adherence: number | null = null
  if (doseLogs && doseLogs.length > 0) {
    const confirmed = doseLogs.filter(d => d.status === 'confirmed').length
    adherence = Math.round((confirmed / doseLogs.length) * 100)
  }

  // Determine stage info
  const activeJourney = (journeysRes.data || []).find((j: any) => j.status === 'active')
  const stage = activeJourney?.type || 'unknown'
  let weekOrAge: string | null = null

  if (stage === 'pregnancy' && mp?.lmp_date) {
    const weeks = Math.floor((Date.now() - new Date(mp.lmp_date).getTime()) / (7 * 86_400_000))
    weekOrAge = `${weeks} нед.`
  }

  const children = childrenRes.data || []
  if (children[0]?.dob && ['postpartum', 'infant', 'toddler'].includes(stage)) {
    const months = Math.floor((Date.now() - new Date(children[0].dob).getTime()) / (30 * 86_400_000))
    weekOrAge = months >= 12 ? `${Math.floor(months / 12)} г. ${months % 12} мес.` : `${months} мес.`
  }

  // Journey progress
  let totalEvents = 0, completedEvents = 0, overdueEvents = 0
  if (activeJourney?.journey_events) {
    const events = activeJourney.journey_events as any[]
    totalEvents = events.length
    completedEvents = events.filter((e: any) => e.status === 'completed').length
    overdueEvents = events.filter((e: any) => e.status === 'overdue').length
  }

  return {
    family: {
      id: family.id,
      status: family.status,
      created_at: family.created_at,
      mother: parent ? { id: parent.id, name: `${parent.last_name} ${parent.first_name}`, phone: parent.phone, email: parent.email, last_seen: parent.last_seen_at } : null,
      father: secondary ? { id: secondary.id, name: `${secondary.last_name} ${secondary.first_name}`, phone: secondary.phone } : null,
      mother_profile: mp || null,
    },
    children,
    stage,
    week_or_age: weekOrAge,
    adherence,
    journey: activeJourney ? {
      id: activeJourney.id,
      type: activeJourney.type,
      status: activeJourney.status,
      total_events: totalEvents,
      completed_events: completedEvents,
      overdue_events: overdueEvents,
      progress_pct: totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0,
      events: activeJourney.journey_events || [],
    } : null,
    prescriptions: prescriptionsRes.data || [],
    appointments: (appointmentsRes.data || []).map((a: any) => {
      const doc = Array.isArray(a.doctor) ? a.doctor[0] : a.doctor
      const docUser = doc?.user ? (Array.isArray(doc.user) ? doc.user[0] : doc.user) : null
      return {
        ...a,
        doctor_name: docUser ? `${docUser.last_name} ${docUser.first_name}` : null,
      }
    }),
    pending_tasks: overdueTasksRes.data || [],
    notes: (notesRes.data || []).map((n: any) => {
      const author = Array.isArray(n.author) ? n.author[0] : n.author
      return { ...n, author_name: author ? `${author.first_name} ${author.last_name}` : null }
    }),
  }
})
