import OpenAI from 'openai'

interface ChatBody {
  message: string
  conversation_history?: { role: 'user' | 'assistant'; content: string }[]
  child_context?: {
    name?: string
    age_months?: number
    gender?: string
  }
}

const SYSTEM_PROMPT = `Ты — Care AI, дружелюбный помощник для родителей. Ты помогаешь с вопросами о здоровье, развитии, питании и сне детей.

СТРОГИЕ ПРАВИЛА:
1. НИКОГДА не ставь диагнозы. Говори "обратитесь к врачу для диагностики".
2. НИКОГДА не назначай лекарства, дозировки или схемы лечения.
3. При описании тревожных симптомов (высокая температура >39°C, судороги, затруднённое дыхание, обезвоживание) — настоятельно рекомендуй вызвать скорую или обратиться в приёмное отделение НЕМЕДЛЕННО.
4. Давай общую информацию, основанную на рекомендациях ВОЗ и казахстанских протоколах.
5. Каждый ответ заканчивай напоминанием: "Для точной оценки проконсультируйтесь с вашим врачом."
6. Отвечай на русском языке.
7. Будь тёплым и поддерживающим в тоне.
8. Если вопрос не связан с детским здоровьем или родительством — вежливо откажись и верни к теме.`

function buildChildContext(child?: ChatBody['child_context']): string {
  if (!child) return ''
  const parts: string[] = []
  if (child.name) parts.push(`Имя ребёнка: ${child.name}`)
  if (child.age_months !== undefined) {
    if (child.age_months < 1) parts.push('Возраст: новорождённый')
    else if (child.age_months < 12) parts.push(`Возраст: ${child.age_months} мес.`)
    else parts.push(`Возраст: ${Math.floor(child.age_months / 12)} г. ${child.age_months % 12} мес.`)
  }
  if (child.gender) parts.push(`Пол: ${child.gender === 'male' ? 'мальчик' : 'девочка'}`)
  return parts.length ? `\n\nКонтекст ребёнка:\n${parts.join('\n')}` : ''
}

import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Require authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const config = useRuntimeConfig()
  const apiKey = config.openaiApiKey

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'OpenAI API key not configured' })
  }

  const body = await readBody<ChatBody>(event)

  if (!body?.message || typeof body.message !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Message is required' })
  }

  const trimmed = body.message.trim()
  if (trimmed.length === 0 || trimmed.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Message must be 1-2000 characters' })
  }

  const childContext = buildChildContext(body.child_context)

  const openai = new OpenAI({ apiKey })

  // Build message array with conversation history (last 10 messages max)
  const history = Array.isArray(body.conversation_history)
    ? body.conversation_history
        .slice(-10)
        .filter(m => m.role && m.content && typeof m.content === 'string')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 2000) }))
    : []

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 800,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + childContext },
      ...history,
      { role: 'user', content: trimmed },
    ],
  })

  const response = completion.choices[0]?.message?.content || 'Не удалось получить ответ.'

  return { response }
})
