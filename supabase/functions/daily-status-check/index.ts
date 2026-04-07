import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createSupabaseAdmin, jsonResponse, errorResponse, corsHeaders } from '../_shared/supabase.ts'

/**
 * daily-status-check (Cron: 06:00 Asia/Almaty)
 *
 * 1. upcoming → due (due_date = today)
 * 2. due → overdue (due_date < today, still not completed)
 * 3. Create coordinator_tasks for overdue mandatory events
 * 4. Generate today's dose_logs for active prescriptions
 * 5. Mark unconfirmed yesterday's doses as missed
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabase = createSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const stats = {
      events_became_due: 0,
      events_became_overdue: 0,
      tasks_created: 0,
      doses_generated: 0,
      doses_marked_missed: 0,
    }

    // ── 1. upcoming → due ──
    const { data: newDue } = await supabase
      .from('journey_events')
      .update({ status: 'due' })
      .eq('status', 'upcoming')
      .eq('due_date', today)
      .select('id')

    stats.events_became_due = newDue?.length || 0

    // ── 2. due → overdue ──
    const { data: newOverdue } = await supabase
      .from('journey_events')
      .update({ status: 'overdue' })
      .eq('status', 'due')
      .lt('due_date', today)
      .select('id, journey_id, title, is_mandatory')

    stats.events_became_overdue = newOverdue?.length || 0

    // ── 3. Create coordinator tasks for overdue mandatory events ──
    if (newOverdue && newOverdue.length > 0) {
      const mandatoryOverdue = newOverdue.filter((e) => e.is_mandatory)

      for (const evt of mandatoryOverdue) {
        // Get family_id and clinic_id from journey
        const { data: journey } = await supabase
          .from('journeys')
          .select('family_id, family:families(clinic_id)')
          .eq('id', evt.journey_id)
          .single()

        if (!journey) continue

        const clinicId = (journey.family as { clinic_id: string })?.clinic_id
        if (!clinicId) continue

        // Check if a task already exists for this event
        const { data: existingTask } = await supabase
          .from('coordinator_tasks')
          .select('id')
          .eq('family_id', journey.family_id)
          .eq('type', 'overdue_followup')
          .eq('status', 'pending')
          .ilike('title', `%${evt.title}%`)
          .maybeSingle()

        if (!existingTask) {
          await supabase.from('coordinator_tasks').insert({
            clinic_id: clinicId,
            family_id: journey.family_id,
            type: 'overdue_followup',
            priority: 'high',
            status: 'pending',
            due_date: today,
            title: `${evt.title} — просрочено`,
            notes: `Обязательное событие "${evt.title}" не выполнено`,
            created_by: 'system',
          })
          stats.tasks_created++
        }
      }
    }

    // ── 4. Generate today's dose_logs for active prescriptions ──
    const { data: activePrescriptions } = await supabase
      .from('prescriptions')
      .select('id, family_id, time_of_day, start_date, end_date')
      .eq('is_active', true)
      .lte('start_date', today)

    if (activePrescriptions) {
      for (const rx of activePrescriptions) {
        // Skip if end_date has passed
        if (rx.end_date && rx.end_date < today) continue

        const times: string[] = rx.time_of_day || ['morning']

        for (const timeSlot of times) {
          // Determine hour based on time slot
          let hour = 8
          if (timeSlot === 'afternoon') hour = 14
          else if (timeSlot === 'evening') hour = 20
          else if (timeSlot === 'night') hour = 22

          const scheduledAt = `${today}T${String(hour).padStart(2, '0')}:00:00+06:00`

          // Check if dose_log already exists for this prescription + time today
          const { data: existing } = await supabase
            .from('dose_logs')
            .select('id')
            .eq('prescription_id', rx.id)
            .gte('scheduled_at', `${today}T00:00:00`)
            .lt('scheduled_at', `${today}T23:59:59`)
            .eq('scheduled_at', scheduledAt)
            .maybeSingle()

          if (!existing) {
            await supabase.from('dose_logs').insert({
              prescription_id: rx.id,
              family_id: rx.family_id,
              scheduled_at: scheduledAt,
              status: 'pending',
            })
            stats.doses_generated++
          }
        }
      }
    }

    // ── 5. Mark yesterday's unconfirmed doses as missed ──
    const { data: missedDoses } = await supabase
      .from('dose_logs')
      .update({ status: 'missed' })
      .eq('status', 'pending')
      .gte('scheduled_at', `${yesterday}T00:00:00`)
      .lt('scheduled_at', `${today}T00:00:00`)
      .select('id')

    stats.doses_marked_missed = missedDoses?.length || 0

    // ── 6. Create low_adherence tasks ──
    // Check families with 3+ consecutive missed doses
    if (missedDoses && missedDoses.length > 0) {
      const { data: lowAdherenceFamilies } = await supabase
        .rpc('get_families_with_low_adherence', { consecutive_missed: 3 })

      // This RPC may not exist yet — skip gracefully
      if (lowAdherenceFamilies) {
        for (const fam of lowAdherenceFamilies) {
          await supabase.from('coordinator_tasks').insert({
            clinic_id: fam.clinic_id,
            family_id: fam.family_id,
            type: 'low_adherence',
            priority: 'medium',
            status: 'pending',
            due_date: today,
            title: 'Низкая приверженность назначениям',
            notes: `3+ пропуска подряд. Текущий adherence: ${fam.adherence_percent}%`,
            created_by: 'system',
          })
          stats.tasks_created++
        }
      }
    }

    return jsonResponse({
      success: true,
      date: today,
      stats,
    })
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500)
  }
})
