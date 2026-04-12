# WellNest Monetization Plan — Freemium Model

## Overview

AI features (Claude API calls via Supabase Edge Functions) carry a real per-call cost. The freemium model keeps the core app free while gating the high-cost AI features behind a Pro subscription.

---

## Tiers

### Free (forever)
| Feature | Rationale |
|---|---|
| All manual tracking — medications, water, sleep, exercise, weight, symptoms | Core value; must be free to drive adoption |
| `check-critical-values` Edge Function | Safety-critical; gating it creates bad UX and optics |
| `detect-report-type` Edge Function | Tiny cost; needed just to upload a report |
| `generate-motivational-message` Edge Function | Cheap; strong retention driver |
| Family circle (invite, messaging) | Core social feature |
| Medical ID | Safety feature |

### Pro (~$4.99/month or ~$39/year)
| Feature | Rationale |
|---|---|
| `process-lab-report` | Highest value + highest cost |
| `process-imaging-report` | Highest value + highest cost |
| `process-prescription` | Medium cost; power-user feature |
| `generate-visit-preparation` | High perceived value — worth $5 alone to a patient |
| `generate-condition-connections` | Medium cost; advanced insight |
| `generate-side-effect-guidance` | Low cost; included in Pro for completeness |

**Free trial:** 3 AI report analyses free at signup to let users experience the value before being asked to pay.

---

## Implementation Plan

### 1. Database
```sql
-- Add to public.users
ALTER TABLE public.users
  ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro')),
  ADD COLUMN subscription_expires_at timestamptz;
```

### 2. Edge Function gating
Add a tier check at the top of each gated Edge Function:
```typescript
const { data: user } = await supabase
  .from('users')
  .select('subscription_tier, subscription_expires_at')
  .eq('id', userId)
  .single()

const isPro = user?.subscription_tier === 'pro'
  && (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date())

if (!isPro) {
  return new Response(JSON.stringify({ error: 'Pro subscription required' }), { status: 402 })
}
```

### 3. Payments
- **Option A:** Stripe (web-first, lower fees, full control)
- **Option B:** RevenueCat (if native mobile app is added later)

Recommendation: start with Stripe. Add a `/settings/billing` screen with a Stripe Checkout redirect.

### 4. UI gating
- Show a "Pro" badge on locked features
- Show upgrade prompt when a free user tries to upload a report
- Display remaining free trial analyses if applicable

---

## Cost Estimate Reference

| Function | Typical tokens | Est. cost per call |
|---|---|---|
| `process-lab-report` | ~3,000–8,000 | ~$0.03–0.08 |
| `process-imaging-report` | ~3,000–8,000 | ~$0.03–0.08 |
| `generate-visit-preparation` | ~2,000–4,000 | ~$0.02–0.04 |
| `generate-condition-connections` | ~1,000–2,000 | ~$0.01–0.02 |
| `process-prescription` | ~1,000–3,000 | ~$0.01–0.03 |
| `generate-motivational-message` | ~200–400 | ~$0.002 |
| `detect-report-type` | ~100–200 | ~$0.001 |

At $4.99/month, a user uploading 10 reports/month (~$0.50–0.80 in API cost) leaves healthy margin.
