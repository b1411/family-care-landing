<template>
  <div class="referral-page">
    <header class="page-header">
      <h1 class="page-title">Реферальная программа</h1>
    </header>

    <!-- My referral card -->
    <div class="referral-card">
      <div class="ref-stats">
        <div class="ref-stat">
          <span class="ref-num">{{ stats.totalInvited }}</span>
          <span class="ref-label">Приглашено</span>
        </div>
        <div class="ref-stat">
          <span class="ref-num">{{ stats.registered }}</span>
          <span class="ref-label">Зарегистрировано</span>
        </div>
        <div class="ref-stat">
          <span class="ref-num">{{ formatCurrency(stats.bonusEarned) }}</span>
          <span class="ref-label">Бонусов</span>
        </div>
      </div>

      <div class="ref-code-section">
        <label>Ваш реферальный код</label>
        <div class="code-row">
          <span class="ref-code">{{ referralCode }}</span>
          <button class="btn-copy" @click="copyCode">
            <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" size="16" />
          </button>
        </div>
      </div>

      <div class="share-section">
        <p class="share-hint">Поделитесь ссылкой и получите бонус за каждую зарегистрированную семью</p>
        <div class="share-buttons">
          <button class="share-btn whatsapp" @click="shareVia('whatsapp')">
            <Icon name="lucide:message-circle" size="18" /> WhatsApp
          </button>
          <button class="share-btn copy" @click="copyLink">
            <Icon name="lucide:link" size="18" /> Копировать ссылку
          </button>
        </div>
      </div>
    </div>

    <!-- Loyalty balance -->
    <section class="section">
      <h2 class="section-title">Баланс лояльности</h2>
      <div class="loyalty-card">
        <div class="loyalty-balance">
          <span class="balance-value">{{ formatCurrency(loyaltyBalance) }}</span>
          <span class="balance-label">Доступно</span>
        </div>
        <div class="loyalty-tier">
          <span class="tier-badge" :class="tier">{{ tierLabel }}</span>
          <span class="tier-progress">{{ tierPoints }}/{{ nextTierAt }} баллов</span>
        </div>
      </div>
    </section>

    <!-- History -->
    <section class="section">
      <h2 class="section-title">История бонусов</h2>
      <div v-if="history.length" class="history-list">
        <div v-for="item in history" :key="item.id" class="history-row">
          <div class="history-icon" :class="item.type">
            <Icon :name="item.type === 'earn' ? 'lucide:plus' : 'lucide:minus'" size="14" />
          </div>
          <div class="history-details">
            <span class="history-desc">{{ item.description }}</span>
            <span class="history-date">{{ item.date }}</span>
          </div>
          <span class="history-amount" :class="item.type">
            {{ item.type === 'earn' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </span>
        </div>
      </div>
      <p v-else class="empty-text">Пока нет операций</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

definePageMeta({ layout: 'app' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const stats = reactive({ totalInvited: 0, registered: 0, bonusEarned: 0 })
const referralCode = ref('')
const copied = ref(false)
const loyaltyBalance = ref(0)
const tier = ref('bronze')
const tierLabel = computed(() => {
  const map: Record<string, string> = { bronze: 'Бронза', silver: 'Серебро', gold: 'Золото', platinum: 'Платина' }
  return map[tier.value] || 'Бронза'
})
const tierPoints = ref(0)
const nextTierAt = ref(1000)
const history = ref<Array<{ id: string; type: string; description: string; date: string; amount: number }>>([])

function copyCode() {
  navigator.clipboard.writeText(referralCode.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function copyLink() {
  const url = `${window.location.origin}/auth/invite/${referralCode.value}`
  navigator.clipboard.writeText(url)
}

function shareVia(platform: string) {
  const url = `${window.location.origin}/auth/invite/${referralCode.value}`
  const text = 'Присоединяйтесь к Family Care OS! Используйте мой код:'
  if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank')
  }
}

onMounted(async () => {
  if (!user.value) return

  // Load referral data
  const { data: ref$ } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.value.id)

  const referrals = (ref$ || []) as Array<Record<string, unknown>>
  stats.totalInvited = referrals.length
  stats.registered = referrals.filter(r => r.status === 'registered').length
  stats.bonusEarned = referrals.reduce((s, r) => s + (Number(r.bonus_amount) || 0), 0)

  // Generate code from user ID prefix
  referralCode.value = user.value.id.substring(0, 8).toUpperCase()

  // Loyalty
  const { data: loyalty } = await supabase
    .from('loyalty_balances')
    .select('*')
    .eq('user_id', user.value.id)
    .single()

  if (loyalty) {
    const l = loyalty as Record<string, unknown>
    loyaltyBalance.value = Number(l.balance) || 0
    tier.value = String(l.tier || 'bronze')
    tierPoints.value = Number(l.total_points) || 0
    nextTierAt.value = Number(l.next_tier_at) || 1000
  }

  // History
  const { data: hist } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(20)

  history.value = (hist || []).map((h: Record<string, unknown>) => ({
    id: String(h.id),
    type: Number(h.amount) >= 0 ? 'earn' : 'spend',
    description: String(h.description || ''),
    date: new Date(h.created_at as string).toLocaleDateString('ru-RU'),
    amount: Math.abs(Number(h.amount)),
  }))
})
</script>

<style scoped>
.referral-page { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; }

.referral-card { padding: 24px; background: linear-gradient(135deg, rgba(139, 126, 200, 0.08), rgba(232, 160, 191, 0.08)); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); margin-bottom: 24px; }
.ref-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; text-align: center; }
.ref-num { display: block; font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); }
.ref-label { font-size: 0.75rem; color: var(--color-text-secondary); }

.ref-code-section { margin-bottom: 16px; }
.ref-code-section label { font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px; }
.code-row { display: flex; align-items: center; gap: 8px; }
.ref-code { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); letter-spacing: 0.1em; color: var(--color-primary); }
.btn-copy { padding: 6px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); cursor: pointer; }

.share-hint { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 10px; }
.share-buttons { display: flex; gap: 8px; }
.share-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border: none; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: var(--font-body); }
.share-btn.whatsapp { background: #25D366; color: white; }
.share-btn.copy { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-primary); }

.section { margin-bottom: 24px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; }

.loyalty-card { padding: 20px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; }
.balance-value { display: block; font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.balance-label { font-size: 0.75rem; color: var(--color-text-secondary); }
.tier-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
.tier-badge.bronze { background: #CD7F3233; color: #CD7F32; }
.tier-badge.silver { background: #C0C0C033; color: #888; }
.tier-badge.gold { background: #FFD70033; color: #B8860B; }
.tier-badge.platinum { background: #E5E4E233; color: #666; }
.tier-progress { display: block; font-size: 0.7rem; color: var(--color-text-muted); text-align: right; margin-top: 4px; }

.history-list { display: flex; flex-direction: column; gap: 6px; }
.history-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-sm); }
.history-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.history-icon.earn { background: rgba(124, 184, 212, 0.15); color: var(--color-success); }
.history-icon.spend { background: rgba(231, 111, 81, 0.15); color: var(--color-danger); }
.history-details { flex: 1; }
.history-desc { font-size: 0.85rem; font-weight: 500; display: block; }
.history-date { font-size: 0.7rem; color: var(--color-text-muted); }
.history-amount { font-weight: 700; font-family: var(--font-mono); font-size: 0.9rem; }
.history-amount.earn { color: var(--color-success); }
.history-amount.spend { color: var(--color-danger); }

.empty-text { font-size: 0.85rem; color: var(--color-text-muted); }
</style>
