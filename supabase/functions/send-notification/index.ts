import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createSupabaseAdmin, jsonResponse, errorResponse, corsHeaders } from '../_shared/supabase.ts'

/**
 * send-notification
 *
 * Multi-channel notification dispatcher.
 * Input: {
 *   user_id,
 *   type,              // e.g. 'dose_reminder', 'appointment_reminder_24h', 'event_due'
 *   title,
 *   body,
 *   channels?: string[], // ['in_app', 'push', 'whatsapp'] — defaults to ['in_app']
 *   data?: object        // extra payload
 * }
 *
 * Respects user consents — skips channels the user hasn't opted into.
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const supabase = createSupabaseAdmin()
    const body = await req.json()

    const { user_id, type, title, body: notifBody, channels, data } = body

    if (!user_id || !type || !title) {
      return errorResponse('Missing required fields: user_id, type, title')
    }

    const requestedChannels: string[] = channels || ['in_app']
    const results: Record<string, string> = {}

    // Fetch user consents
    const { data: consents } = await supabase
      .from('consents')
      .select('type, granted')
      .eq('user_id', user_id)

    const consentMap = new Map<string, boolean>()
    if (consents) {
      for (const c of consents) {
        consentMap.set(c.type, c.granted)
      }
    }

    for (const channel of requestedChannels) {
      // Check consent (in_app always allowed)
      if (channel !== 'in_app') {
        const consentKey = channel === 'push' ? 'push' : channel
        if (!consentMap.get(consentKey)) {
          results[channel] = 'skipped_no_consent'
          continue
        }
      }

      // Create notification record
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id,
        type,
        channel,
        title,
        body: notifBody || null,
        data: data || {},
        status: channel === 'in_app' ? 'delivered' : 'pending',
        sent_at: channel === 'in_app' ? new Date().toISOString() : null,
      })

      if (insertError) {
        results[channel] = `error: ${insertError.message}`
        continue
      }

      // Dispatch to external channels
      if (channel === 'push') {
        const sent = await sendPushNotification(user_id, title, notifBody || '', data)
        results[channel] = sent ? 'sent' : 'failed'
      } else if (channel === 'whatsapp') {
        const sent = await sendWhatsApp(user_id, type, title, notifBody || '', supabase)
        results[channel] = sent ? 'sent' : 'failed'
      } else if (channel === 'sms') {
        results[channel] = 'not_implemented'
      } else if (channel === 'email') {
        results[channel] = 'not_implemented'
      } else {
        results[channel] = 'delivered'
      }
    }

    return jsonResponse({
      success: true,
      user_id,
      type,
      channels: results,
    })
  } catch (err) {
    return errorResponse(`Internal error: ${(err as Error).message}`, 500)
  }
})

/**
 * Send Firebase Cloud Messaging push notification.
 */
async function sendPushNotification(
  _userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<boolean> {
  const fcmKey = Deno.env.get('FCM_SERVER_KEY')
  if (!fcmKey) return false

  // TODO: Lookup user's FCM token from a `push_tokens` table
  // For now, log and return true for the record
  console.log(`[FCM] Would send to user: title="${title}", body="${body}", data=${JSON.stringify(data)}`)
  return false // Will return true once FCM token lookup is implemented
}

/**
 * Send WhatsApp message via Meta Cloud API.
 */
async function sendWhatsApp(
  userId: string,
  _templateType: string,
  _title: string,
  _body: string,
  supabase: ReturnType<typeof createSupabaseAdmin>,
): Promise<boolean> {
  const token = Deno.env.get('WHATSAPP_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  if (!token || !phoneNumberId) return false

  // Get user's phone number
  const { data: user } = await supabase
    .from('users')
    .select('phone')
    .eq('id', userId)
    .single()

  if (!user?.phone) return false

  // Format phone for WhatsApp API (remove + prefix)
  const phone = user.phone.replace(/^\+/, '')

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: `${_title}\n\n${_body}` },
        }),
      },
    )

    return response.ok
  } catch {
    return false
  }
}
