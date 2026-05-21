// Firebase Cloud Messaging HTTP v1 client.
// Legacy `fcm.googleapis.com/fcm/send` was decommissioned 2024-06-20.
// This helper does the OAuth2 JWT-bearer flow to obtain an access token
// from a service-account JSON, caches it for ~55 min, and sends to v1 API.

interface ServiceAccount {
  client_email: string
  private_key: string
  project_id: string
}

interface CachedToken {
  accessToken: string
  expiresAt: number
}

let cached: CachedToken | null = null

export function loadServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed.client_email || !parsed.private_key || !parsed.project_id) return null
    return parsed as ServiceAccount
  } catch {
    return null
  }
}

function base64UrlEncode(bytes: Uint8Array | string): string {
  const data = typeof bytes === 'string' ? new TextEncoder().encode(bytes) : bytes
  let binary = ''
  for (const b of data) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0))
  return await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function fetchAccessToken(sa: ServiceAccount): Promise<CachedToken> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`
  const key = await importPrivateKey(sa.private_key)
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))
  const jwt = `${signingInput}.${base64UrlEncode(new Uint8Array(sig))}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    throw new Error(`OAuth2 token exchange failed: ${res.status} ${await res.text()}`)
  }

  const json = await res.json() as { access_token: string; expires_in: number }
  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  }
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.accessToken
  cached = await fetchAccessToken(sa)
  return cached.accessToken
}

export type FcmSendResult = 'sent' | 'invalid_token' | 'failed'

export async function sendFcmV1(
  sa: ServiceAccount,
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<FcmSendResult> {
  const accessToken = await getAccessToken(sa)

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data: data
            ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
            : undefined,
        },
      }),
    },
  )

  if (res.ok) return 'sent'

  // 404 UNREGISTERED or 400 INVALID_ARGUMENT (token-related) → deactivate
  if (res.status === 404 || res.status === 400) {
    const err = await res.json().catch(() => ({})) as { error?: { status?: string } }
    if (err.error?.status === 'UNREGISTERED' || err.error?.status === 'INVALID_ARGUMENT') {
      return 'invalid_token'
    }
  }

  return 'failed'
}
