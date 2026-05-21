import { test, expect } from './helpers/fixtures'

const PROTECTED_PREFIXES = ['/family', '/coordinator', '/doctor', '/chief', '/admin'] as const

type DemoRole = 'mom' | 'doctor' | 'coordinator' | 'admin'

const ALLOWED: Record<DemoRole, string[]> = {
  mom: ['/family'],
  doctor: ['/doctor'],
  coordinator: ['/coordinator'],
  admin: ['/coordinator', '/doctor', '/chief', '/admin'],
}

const HOME: Record<DemoRole, string> = {
  mom: '/family',
  doctor: '/doctor',
  coordinator: '/coordinator',
  admin: '/admin',
}

const FIXTURE: Record<DemoRole, 'familyPage' | 'doctorPage' | 'coordinatorPage' | 'adminPage'> = {
  mom: 'familyPage',
  doctor: 'doctorPage',
  coordinator: 'coordinatorPage',
  admin: 'adminPage',
}

for (const role of Object.keys(ALLOWED) as DemoRole[]) {
  test.describe(`RBAC isolation — role=${role}`, () => {
    for (const prefix of PROTECTED_PREFIXES) {
      const isAllowed = ALLOWED[role].includes(prefix)
      const label = `${prefix} → ${isAllowed ? 'allowed' : 'redirected to ' + HOME[role]}`

      test(label, async (fixtures) => {
        const page = (fixtures as Record<string, import('@playwright/test').Page>)[FIXTURE[role]]
        await page.goto(prefix, { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

        const url = new URL(page.url()).pathname
        if (isAllowed) {
          expect(url, `${role} should stay on ${prefix}`).toMatch(new RegExp(`^${prefix}`))
        } else {
          expect(url, `${role} must NOT reach ${prefix}; expected redirect to ${HOME[role]}`)
            .not.toMatch(new RegExp(`^${prefix}(/|$)`))
        }
      })
    }
  })
}
