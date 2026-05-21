# UMAI Health Platform

Цифровая платформа сопровождения здоровья мамы и ребёнка для частных клиник Казахстана. Объединяет роль семьи (паспорт здоровья, journey-маршрут наблюдения, AI-ассистент), клиники (координатор, врач, главный врач) и платформенного администратора в едином мультитенантном продукте на Nuxt 4 + Supabase.

## Стек

- **Frontend:** Nuxt 4.4 · Vue 3.5 · @nuxt/ui 4 · Pinia · Tailwind/UnoCSS
- **Анимации/визуализация:** GSAP · Lenis · Three.js · ECharts · Lottie
- **Бэкенд:** Nuxt server routes (Nitro) · Supabase (Postgres + Auth + Realtime) · Edge Functions
- **AI:** OpenAI API (Care Assistant с медицинскими safety-rails)
- **Email:** Resend
- **Observability:** Sentry · PostHog
- **Деплой:** Vercel

## Роли и маршруты

| Роль | Префикс | Назначение |
|---|---|---|
| `mother` / `father` | `/family` | Паспорт здоровья ребёнка, прививки, рост, AI-чат, SOS |
| `doctor` / `pediatrician` / `gynecologist` / `nurse` | `/doctor` | Расписание, пациенты, рецепты, care-plans |
| `coordinator` | `/coordinator` | Семьи, задачи, outreach |
| `chief_doctor` | `/chief` | Жалобы, протоколы, аудит врачей, rx-alerts |
| `clinic_admin` / `platform_admin` / `superadmin` | `/admin` | Аналитика, CRM, настройки клиники |

Изоляция ролей реализована тремя слоями: Supabase RLS → Nuxt middleware (`role.global.ts`) → e2e RBAC-матрица в `tests/e2e/rbac-matrix.spec.ts`.

## Требования

- Node.js ≥ 20
- pnpm 10
- Supabase проект (локальный через `supabase start` или облачный)

## Запуск

```bash
pnpm install
cp .env.example .env   # заполнить Supabase / OpenAI / Resend ключи
pnpm dev               # http://localhost:3000
```

Демо-режим: `/demo` — четыре пред-настроенных роли (mom / doctor / coordinator / admin), вход через `DEMO_PASSWORD`.

## Скрипты

| Команда | Что делает |
|---|---|
| `pnpm dev` | Dev-сервер с HMR |
| `pnpm build` | Production-бандл |
| `pnpm preview` | Локальный preview production-сборки |
| `pnpm test` | Unit-тесты (Vitest) |
| `pnpm test:integration` | Integration-тесты против запущенного dev-сервера |
| `pnpm test:e2e` | Playwright e2e (requires dev-server) |
| `pnpm test:visual` | Visual-regression snapshots |

## База данных

33 миграции в `supabase/migrations/` покрывают 77 таблиц. Все таблицы под Row-Level Security; helper-функции (`is_family_member`, `is_staff`, `get_user_clinic_id`) — `SECURITY DEFINER STABLE` с pinned `search_path`. Audit-триггеры пишут изменения `appointments` и `prescriptions` в `doctor_audit_log`.

```bash
supabase start              # локальный стек
supabase db reset           # применить все миграции с нуля
supabase migration new <name>  # новая миграция
```

## CI/CD

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) запускает: lint+typecheck → unit+integration+e2e параллельно. Все стадии **обязательны**, без `continue-on-error`. Деплой — Vercel git integration на push в `main`.

## Документация

- `docs/UMAI_HEALTH_DEV_KB.md` — knowledge base разработчика
- `docs/UMAI_HEALTH_IMPLEMENTATION_GUIDE.md` — архитектура и решения
- `docs/UMAI_HEALTH_LANDING_BLUEPRINT.md` — спецификация лендинга
- `docs/UMAI_HEALTH_SITE_STRUCTURE.md` — IA сайта
- `UMAI_Health_Platform_Passport.docx` — функциональные требования

## Безопасность

- RLS на всех PHI-таблицах
- CSP + HSTS в [`nuxt.config.ts`](./nuxt.config.ts)
- Rate-limit middleware на API
- Sentry с `beforeSend` redaction (email/phone/UUID + ключи `name|child|family|patient|diagnosis|...`)
- Replay с `maskAllText: true` и `blockAllMedia: true`
- `service_role` ключ используется только в server-only endpoints

Уязвимости отправлять на security@umai.health (приватный канал).
