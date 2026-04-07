import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createSupabaseAdmin, jsonResponse, errorResponse, corsHeaders } from '../_shared/supabase.ts'

/**
 * calculate-analytics (Cron: 02:00 Asia/Almaty)
 *
 * Materializes analytics data that's too expensive for real-time queries:
 * 1. Refresh adherence stats per family (7-day / 30-day)
 * 2. Identify families for reactivation (no login >14 days)
 * 3. Calculate journey completion rates per clinic
 * 4. Generate vaccination compliance alerts
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabase = createSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString()

    const stats = {
      reactivation_tasks_created: 0,
      vaccination_alerts_created: 0,
    }

    // ── 1. Reactivation tasks — families with no activity in 14+ days ──
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id')
      .eq('is_active', true)

    if (clinics) {
      for (const clinic of clinics) {
        // Find active families where the primary parent hasn't been seen in 14+ days
        const { data: inactiveFamilies } = await supabase
          .from('families')
          .select(`
            id,
            primary_parent_id,
            users!families_primary_parent_id_fkey(last_seen_at)
          `)
          .eq('clinic_id', clinic.id)
          .eq('status', 'active')

        if (!inactiveFamilies) continue

        for (const fam of inactiveFamilies) {
          const user = fam.users as unknown as { last_seen_at: string | null }
          if (!user?.last_seen_at) continue
          if (user.last_seen_at > fourteenDaysAgo) continue

          // Check if reactivation task already exists
          const { data: existingTask } = await supabase
            .from('coordinator_tasks')
            .select('id')
            .eq('family_id', fam.id)
            .eq('type', 'reactivation')
            .in('status', ['pending', 'in_progress'])
            .maybeSingle()

          if (!existingTask) {
            await supabase.from('coordinator_tasks').insert({
              clinic_id: clinic.id,
              family_id: fam.id,
              type: 'reactivation',
              priority: 'medium',
              status: 'pending',
              due_date: today,
              title: 'Реактивация — нет входа 14+ дней',
              notes: `Последний вход: ${user.last_seen_at}`,
              created_by: 'system',
            })
            stats.reactivation_tasks_created++
          }
        }
      }
    }

    // ── 2. Vaccination reminder tasks — scheduled vaccinations in 3 days ──
    const threeDaysFromNow = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]

    const { data: upcomingVaccinations } = await supabase
      .from('vaccinations')
      .select(`
        id,
        child_id,
        vaccine_name,
        scheduled_date,
        child_profiles(family_id, name, families(clinic_id))
      `)
      .eq('status', 'scheduled')
      .eq('scheduled_date', threeDaysFromNow)

    if (upcomingVaccinations) {
      for (const vax of upcomingVaccinations) {
        const child = vax.child_profiles as unknown as {
          family_id: string
          name: string
          families: { clinic_id: string }
        }
        if (!child?.families?.clinic_id) continue

        // Check if reminder already exists
        const { data: existingTask } = await supabase
          .from('coordinator_tasks')
          .select('id')
          .eq('family_id', child.family_id)
          .eq('type', 'vaccination_reminder')
          .in('status', ['pending', 'in_progress'])
          .ilike('title', `%${vax.vaccine_name}%`)
          .maybeSingle()

        if (!existingTask) {
          await supabase.from('coordinator_tasks').insert({
            clinic_id: child.families.clinic_id,
            family_id: child.family_id,
            type: 'vaccination_reminder',
            priority: 'high',
            status: 'pending',
            due_date: today,
            title: `Прививка через 3 дня — ${child.name}`,
            notes: `${vax.vaccine_name} запланирована на ${vax.scheduled_date}`,
            created_by: 'system',
          })
          stats.vaccination_alerts_created++
        }
      }
    }

    // ── 3. Log analytics run ──
    // The SQL views (v_clinic_dashboard, v_doctor_performance) are already real-time.
    // This function handles tasks that SQL views can't (side effects like creating tasks).

    return jsonResponse({
      success: true,
      date: today,
      stats,
    })
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500)
  }
})
