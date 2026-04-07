<template>
  <div class="coordinator-dashboard">
    <header class="page-header">
      <h1 class="page-title">Панель координатора</h1>
      <p class="page-subtitle">Добро пожаловать, {{ authStore.fullName }}</p>
    </header>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <Icon name="lucide:users" size="20" class="stat-icon" />
        <div class="stat-value">{{ coordinatorStore.stats.total_families || 0 }}</div>
        <div class="stat-label">Семей</div>
      </div>
      <div class="stat-card critical">
        <Icon name="lucide:alert-triangle" size="20" class="stat-icon" />
        <div class="stat-value">{{ coordinatorStore.criticalTasks.length }}</div>
        <div class="stat-label">Срочных задач</div>
      </div>
      <div class="stat-card">
        <Icon name="lucide:clipboard-list" size="20" class="stat-icon" />
        <div class="stat-value">{{ coordinatorStore.pendingTasks.length }}</div>
        <div class="stat-label">В работе</div>
      </div>
      <div class="stat-card">
        <Icon name="lucide:calendar" size="20" class="stat-icon" />
        <div class="stat-value">{{ coordinatorStore.stats.today_appointments || 0 }}</div>
        <div class="stat-label">Записей сегодня</div>
      </div>
    </div>

    <!-- Critical Tasks -->
    <section v-if="coordinatorStore.criticalTasks.length" class="section critical-section">
      <h2 class="section-title">
        <Icon name="lucide:alert-triangle" size="16" class="critical-icon" /> Требуют внимания
      </h2>
      <div class="task-list">
        <div v-for="task in coordinatorStore.criticalTasks" :key="task.id" class="task-card critical">
          <div class="task-content">
            <h3>{{ task.title }}</h3>
            <p v-if="task.description">{{ task.description }}</p>
            <span class="task-meta">{{ task.type }} · {{ formatRelative(task.due_date) }}</span>
          </div>
          <div class="task-actions">
            <button class="btn-task-done" @click="handleComplete(task.id)">Готово</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Pending Tasks -->
    <section v-if="coordinatorStore.pendingTasks.length" class="section">
      <h2 class="section-title">Задачи</h2>
      <div class="task-list">
        <div v-for="task in coordinatorStore.pendingTasks" :key="task.id" class="task-card">
          <div class="task-content">
            <h3>{{ task.title }}</h3>
            <p v-if="task.description">{{ task.description }}</p>
            <span class="task-meta">{{ taskTypeLabel(task.type) }} · {{ formatRelative(task.due_date) }}</span>
          </div>
          <div class="task-actions">
            <button class="btn-task-done" @click="handleComplete(task.id)">✓</button>
            <button class="btn-task-dismiss" @click="handleDismiss(task.id)">✕</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick links -->
    <div class="quick-links">
      <NuxtLink to="/coordinator/families" class="quick-link">
        <Icon name="lucide:users" size="20" />
        <span>Все семьи</span>
        <Icon name="lucide:chevron-right" size="16" />
      </NuxtLink>
      <NuxtLink to="/coordinator/tasks" class="quick-link">
        <Icon name="lucide:clipboard-list" size="20" />
        <span>Все задачи</span>
        <Icon name="lucide:chevron-right" size="16" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelative } from '~/utils/formatters'

definePageMeta({ layout: 'app' })

const authStore = useAuthStore()
const coordinatorStore = useCoordinatorStore()

function taskTypeLabel(type: string) {
  const map: Record<string, string> = {
    reminder: 'Напоминание',
    alert: 'Оповещение',
    follow_up: 'Контроль',
    documentation: 'Документация',
    outreach: 'Аутрич',
  }
  return map[type] || type
}

function handleComplete(taskId: string) {
  coordinatorStore.completeTask(taskId)
}

function handleDismiss(taskId: string) {
  coordinatorStore.dismissTask(taskId)
}

onMounted(async () => {
  if (authStore.clinicId) {
    await Promise.all([
      coordinatorStore.fetchTasks(authStore.clinicId),
      coordinatorStore.fetchStats(authStore.clinicId),
    ])
  }
})
</script>

<style scoped>
.coordinator-dashboard { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
.page-header { margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; }
.page-subtitle { font-size: 0.9rem; color: var(--color-text-secondary); margin-top: 4px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
.stat-card {
  display: flex; flex-direction: column; align-items: center; padding: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md); text-align: center;
}
.stat-card.critical { border-color: rgba(231, 111, 81, 0.3); }
.stat-icon { color: var(--color-primary); margin-bottom: 8px; }
.stat-card.critical .stat-icon { color: var(--color-danger); }
.stat-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.stat-label { font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px; }

.section { margin-bottom: 28px; }
.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.critical-icon { color: var(--color-danger); }

.task-list { display: flex; flex-direction: column; gap: 8px; }
.task-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
}
.task-card.critical { border-left: 3px solid var(--color-danger); background: rgba(231, 111, 81, 0.03); }
.task-content { flex: 1; }
.task-content h3 { font-size: 0.9rem; font-weight: 600; }
.task-content p { font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px; }
.task-meta { font-size: 0.75rem; color: var(--color-text-muted); }

.task-actions { display: flex; gap: 6px; }
.btn-task-done {
  padding: 6px 12px; background: rgba(124, 184, 212, 0.1); color: var(--color-success);
  border: 1px solid rgba(124, 184, 212, 0.3); border-radius: 6px; cursor: pointer;
  font-size: 0.8rem; font-weight: 600; font-family: var(--font-body);
}
.btn-task-dismiss {
  padding: 6px 10px; background: none; border: 1px solid var(--color-border);
  border-radius: 6px; cursor: pointer; color: var(--color-text-muted); font-family: var(--font-body);
}

.quick-links { display: flex; flex-direction: column; gap: 8px; }
.quick-link {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm); text-decoration: none; color: var(--color-text-primary);
  transition: all var(--transition-fast);
}
.quick-link:hover { box-shadow: var(--shadow-sm); }
.quick-link span { flex: 1; font-weight: 500; }
</style>
