import { test, expect, type Page } from '@playwright/test'

/**
 * Guardian / managed-profile flows against a mocked Supabase (no network, no real data).
 * Run with:
 *   VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_ANON_KEY=test npx playwright test guardian
 * The database rules themselves are covered by supabase/tests/guardian_access_test.sql.
 */

const SUPABASE = 'http://localhost:54321'
const ME = 'aaaaaaaa-0000-0000-0000-000000000001'
const KID = 'kkkkkkkk-0000-0000-0000-000000000002'
const GUARD_ROW = 'gggggggg-0000-0000-0000-000000000003'

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
const fakeJwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: ME, role: 'authenticated', exp: 4102444800 })}.sig`

const eighteen = new Date()
eighteen.setFullYear(eighteen.getFullYear() + 8)
const endsOn = eighteen.toISOString().slice(0, 10)

interface Recorded {
  method: string
  url: string
  body: string | null
}

async function mockSupabase(page: Page, opts: { removeError?: string } = {}) {
  const calls: Recorded[] = []

  await page.addInitScript(
    ([key, session]) => localStorage.setItem(key, session),
    [
      'sb-localhost-auth-token',
      JSON.stringify({
        access_token: fakeJwt,
        refresh_token: 'r',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: 4102444800,
        user: { id: ME, email: 'me@test.local', aud: 'authenticated', app_metadata: {}, user_metadata: {} },
      }),
    ],
  )

  await page.route(`${SUPABASE}/**`, async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname
    calls.push({ method: req.method(), url: req.url(), body: req.postData() })
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    const wantsObject = (req.headers()['accept'] ?? '').includes('vnd.pgrst.object')
    const rows = (list: unknown[]) => (wantsObject ? json(list.length ? 200 : 406, list[0] ?? null) : json(200, list))

    if (path === '/auth/v1/user') return json(200, { id: ME, email: 'me@test.local' })

    if (path.startsWith('/rpc/') || path.startsWith('/rest/v1/rpc/')) {
      const name = path.split('/').pop()
      if (name === 'create_managed_profile') return json(200, 'nnnnnnnn-0000-0000-0000-000000000009')
      if (name === 'create_claim_invite') return json(200, 'claim-token-123')
      return json(200, null)
    }

    const table = path.replace('/rest/v1/', '')
    if (req.method() === 'DELETE') {
      return opts.removeError
        ? json(400, { message: opts.removeError })
        : route.fulfill({ status: 204 })
    }
    if (req.method() !== 'GET') return json(201, {})

    if (table === 'users') {
      const id = (url.searchParams.get('id') ?? '').replace('eq.', '')
      if (id === KID) return rows([{ id: KID, name: 'Kid Test', is_managed: true, date_of_birth: '2016-05-01' }])
      // The signed-in user has a blank profile, so only the managed profile exists for them
      return rows([{ id: ME, email: 'me@test.local', name: 'Parent Test' }])
    }
    if (table === 'family_members') {
      const select = url.searchParams.get('select') ?? ''
      if (url.searchParams.get('can_edit') === 'eq.false') return rows([]) // no view-only circle memberships
      if (select.includes('users!patient_id')) {
        return json(200, [{
          patient_id: KID, relationship: 'Mother', is_self: false,
          users: { id: KID, name: 'Kid Test', date_of_birth: '2016-05-01', guardianship_ends_on: endsOn },
        }])
      }
      return json(200, [
        { id: GUARD_ROW, name: 'Parent Test', relationship: 'Mother', user_id: ME, is_self: false, accepted_at: '2026-01-01', invite_token: null },
        { id: 'other-guardian', name: 'Spouse', relationship: 'Father', user_id: 'someone-else', is_self: false, accepted_at: '2026-01-01', invite_token: null },
      ])
    }
    return json(200, [])
  })

  return calls
}

const hasQuery = (calls: Recorded[], table: string, needle: string) =>
  calls.some((c) => c.url.includes(`/rest/v1/${table}`) && c.url.includes(needle))

test.describe('guardian and managed profiles', () => {
  test('switching to a managed person scopes data requests to them and shows a banner', async ({ page }) => {
    const calls = await mockSupabase(page)
    await page.goto('/dashboard')

    const tablist = page.getByRole('tablist', { name: 'Whose health are you viewing?' })
    await expect(tablist).toBeVisible()
    await expect(tablist.getByRole('tab', { name: /Me/ })).toHaveAttribute('aria-selected', 'true')
    // A guardian is not a view-only family member, so no "Circle" role tab appears
    await expect(page.getByText(/'s Circle/)).toHaveCount(0)

    await tablist.getByRole('tab', { name: /Kid/ }).click()
    await expect(page.getByRole('status')).toContainText("Kid's health, not your own")
    await expect(tablist.getByRole('tab', { name: /Kid/ })).toHaveAttribute('aria-selected', 'true')

    // Data for the child is requested, keyed on the child's id
    await expect.poll(() => hasQuery(calls, 'medications', `patient_id=eq.${KID}`)).toBe(true)
    await page.screenshot({ path: 'test-results/guardian-switcher.png' })
  })

  test('People screen: shows the 18-year rule and adds a child with the right arguments', async ({ page }) => {
    const calls = await mockSupabase(page)
    await page.goto('/people')

    await expect(page.getByText('Kid Test')).toBeVisible()
    await expect(page.getByText(/until their 18th birthday/)).toBeVisible()

    await page.getByRole('button', { name: '+ Add a person' }).click()
    await page.getByLabel('Name *').fill('Little One')
    await page.getByLabel('Date of birth').fill('2018-02-28')
    await expect(page.getByText(/Guardianship of a child ends on their 18th birthday/)).toContainText(/February 28, 2036|28 February 2036/)
    await page.getByRole('button', { name: 'Add person' }).click()

    await expect.poll(() => calls.find((c) => c.url.endsWith('/rpc/create_managed_profile'))?.body).toBeTruthy()
    const body = JSON.parse(calls.find((c) => c.url.endsWith('/rpc/create_managed_profile'))!.body!)
    expect(body).toMatchObject({ p_name: 'Little One', p_date_of_birth: '2018-02-28', p_is_minor: true })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('an adult cannot be added as a child, and a missing date of birth blocks a minor', async ({ page }) => {
    await mockSupabase(page)
    await page.goto('/people')
    await page.getByRole('button', { name: '+ Add a person' }).click()
    await page.getByLabel('Name *').fill('Grandma')
    await page.getByLabel('Date of birth').fill('1950-01-01')
    // Over 18: no under-18 notice appears
    await expect(page.getByText(/Guardianship of a child ends/)).toHaveCount(0)

    await page.getByLabel('Date of birth').fill('')
    await page.getByLabel('This person is under 18').check()
    await expect(page.getByText(/Add their date of birth to continue/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add person' })).toBeDisabled()
  })

  test('creates a one-time invite link for the child to take over their profile', async ({ page }) => {
    await mockSupabase(page)
    await page.goto('/people')
    await page.getByRole('button', { name: 'Invite them to use WellNest' }).click()
    await expect(page.getByText(/\/join\?token=claim-token-123/)).toBeVisible()
  })

  test('guardians can remove each other; the last-guardian error from the database is shown', async ({ page }) => {
    const calls = await mockSupabase(page, { removeError: 'A managed profile must keep at least one guardian' })
    page.on('dialog', (d) => d.accept())
    await page.goto('/people')

    await page.getByRole('button', { name: 'Guardians' }).click()
    await expect(page.getByText('Spouse · Father')).toBeVisible()
    await page.getByRole('button', { name: 'Remove Spouse' }).click()

    await expect.poll(() => calls.some((c: Recorded) => c.method === 'DELETE' && c.url.includes('family_members'))).toBe(true)
    await expect(page.getByRole('alert')).toContainText('at least one guardian')
  })
})

