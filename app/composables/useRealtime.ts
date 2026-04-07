import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Composable for Supabase Realtime subscriptions.
 * Manages channel lifecycle and auto-cleanup on unmount.
 */
export function useRealtime() {
  const supabase = useSupabaseClient()
  const channels: Ref<RealtimeChannel[]> = ref([])

  /**
   * Subscribe to INSERT/UPDATE/DELETE on a table with optional filter.
   */
  function subscribeToTable(
    table: string,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      filter?: string
      onInsert?: (payload: Record<string, unknown>) => void
      onUpdate?: (payload: Record<string, unknown>) => void
      onDelete?: (payload: Record<string, unknown>) => void
      onChange?: (payload: Record<string, unknown>) => void
    },
  ) {
    const channelName = `${table}-${Date.now()}`
    const event = options.event || '*'

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as never,
        {
          event,
          schema: 'public',
          table,
          filter: options.filter,
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (options.onChange) options.onChange(payload.new || payload.old)
          if (payload.eventType === 'INSERT' && options.onInsert) options.onInsert(payload.new)
          if (payload.eventType === 'UPDATE' && options.onUpdate) options.onUpdate(payload.new)
          if (payload.eventType === 'DELETE' && options.onDelete) options.onDelete(payload.old)
        },
      )
      .subscribe()

    channels.value.push(channel)
    return channel
  }

  /**
   * Subscribe to journey events changes for a family.
   */
  function subscribeToJourneyEvents(journeyId: string, onChange: (event: Record<string, unknown>) => void) {
    return subscribeToTable('journey_events', {
      filter: `journey_id=eq.${journeyId}`,
      onChange,
    })
  }

  /**
   * Subscribe to dose logs for a family's prescriptions.
   */
  function subscribeToDoseLogs(familyId: string, onChange: (log: Record<string, unknown>) => void) {
    return subscribeToTable('dose_logs', {
      filter: `family_id=eq.${familyId}`,
      onChange,
    })
  }

  /**
   * Subscribe to notifications for current user.
   */
  function subscribeToNotifications(userId: string, onNew: (notification: Record<string, unknown>) => void) {
    return subscribeToTable('notifications', {
      event: 'INSERT',
      filter: `user_id=eq.${userId}`,
      onInsert: onNew,
    })
  }

  /**
   * Subscribe to coordinator tasks for a clinic.
   */
  function subscribeToTasks(clinicId: string, onChange: (task: Record<string, unknown>) => void) {
    return subscribeToTable('coordinator_tasks', {
      filter: `clinic_id=eq.${clinicId}`,
      onChange,
    })
  }

  /** Unsubscribe from all channels */
  function unsubscribeAll() {
    for (const channel of channels.value) {
      supabase.removeChannel(channel)
    }
    channels.value = []
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    unsubscribeAll()
  })

  return {
    channels,
    subscribeToTable,
    subscribeToJourneyEvents,
    subscribeToDoseLogs,
    subscribeToNotifications,
    subscribeToTasks,
    unsubscribeAll,
  }
}
