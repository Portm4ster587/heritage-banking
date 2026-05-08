# Heritage Banking — Major Upgrade Plan

This is a large, multi-phase effort. I'll ship it in 4 phases so you can verify each before moving on.

---

## Phase 1 — Cross-Bank Transfer with $50K Threshold

**Behavior**
- Heritage → ACFCU transfer < $50,000:
  - Sender debited immediately, recipient credited (via ACFCU side or pending credit row)
  - Status `completed`, green badge in History, included in balance instantly
- Heritage → ACFCU transfer ≥ $50,000:
  - Status `pending`, **funds held** (debited from available balance, parked in `cross_bank_transfers`)
  - Requires Heritage admin approval **AND** ACFCU webhook `approved` before completion
  - Yellow "Pending review" badge until both approve

**Database**
- New atomic RPC `process_cross_bank_transfer(...)` with `SELECT FOR UPDATE`, threshold logic, idempotent
- Add `held_amount` column to `accounts` for the available-vs-ledger balance display
- Add `requires_dual_approval`, `acfcu_approved_at`, `heritage_approved_at` to `cross_bank_transfers`

**Edge functions**
- `process-cross-bank-transfer` — caller-facing, validates JWT, calls RPC, fans out notifications
- `acfcu-webhook` — receives ACFCU approve/decline (HMAC verified), flips `acfcu_approved_at`, auto-completes if Heritage already approved

**UI**
- Add "Heritage Cross Bank (ACFCU)" tab to `/dashboard/transfers`
- Recipient lookup against `acfcu-lookup-recipient`
- Threshold preview ("This transfer requires admin review")
- Yellow row in RecentTransactions for pending cross-bank entries

---

## Phase 2 — 4-Channel Notification Fan-Out

For every transfer (internal, external, wire, crypto, cross-bank) on **both sender and recipient**:
1. **In-app** — `user_notifications` row (already wired)
2. **Email** — Resend via existing `send-notification-email`
3. **SMS** — Twilio via existing `send-sms-notification`
4. **Browser push** — new: Web Push API + service worker, opt-in toggle in Settings

**Work**
- Centralize fan-out in a single edge function `notify-user` that accepts `{ user_id, title, body, channels }` and dispatches to all 4 in parallel
- Refactor `process-heritage-transfer`, `process-crypto-transfer`, `process-cross-bank-transfer`, ACH/Wire admin approval flows to call `notify-user` instead of duplicating fetches
- Add `push_subscriptions` table + `register-push-subscription` function + `public/sw.js` service worker
- Add VAPID keypair to secrets (will request from you)

---

## Phase 3 — 4 New Banking Tabs

Add these routes + nav entries:

1. **`/dashboard/zelle`** — P2P payments
   - Send to email/phone, recipient lookup against `profiles.phone`/auth email
   - Reuses internal-transfer RPC under the hood
   - Pending invite if recipient not on Heritage

2. **`/dashboard/recurring`** — Scheduled & recurring transfers
   - New `scheduled_transfers` table (frequency, next_run_at, end_date)
   - pg_cron job runs nightly to dispatch due transfers
   - List/create/pause/cancel UI

3. **`/dashboard/budgets`** — Spending insights & budgets
   - Categorize transfers/bill_payments by `category`
   - Monthly budget per category with progress bars
   - Recharts donut + bar visualizations
   - Savings goals with target amount + ETA

4. **`/dashboard/investments`** — Portfolio view
   - Reads `Heritage Investing` account + new `holdings` table (symbol, qty, avg_cost)
   - Live price polling against existing `crypto_assets` pattern (extended for stocks via a quotes edge function)
   - Buy/sell creates a pending order admin approves
   - Portfolio chart, allocation pie, P/L card

---

## Phase 4 — Full QA Pass

I'll go feature-by-feature, fix anything broken, and add a QA note per area:
- Auth (login/signup/admin bypass/pending approval)
- Dashboard (hero, quick actions, recent tx realtime)
- Transfers (5 types, all happy + error paths)
- Cards (issue, lock, limits, reveal/hide)
- Bills (create payee, schedule, pay, autopay)
- Crypto (wallet, internal transfer, instant BTC deposit)
- Statements & 1099 PDFs
- ID.me KYC
- Support chat (user + admin)
- Admin panel (every tab)
- Notifications center
- Mobile responsiveness on 428px

---

## Secrets I'll need from you
- `ACFCU_HMAC_SECRET` (32+ random bytes, hex) — for webhook signing
- `ACFCU_BASE_URL` and `ACFCU_API_KEY` — to call ACFCU's lookup
- `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` — generate at https://vapidkeys.com (I'll walk you through)

---

## Estimated turns
- Phase 1: 2-3 turns (migration + edge functions + UI)
- Phase 2: 2 turns (push setup + refactor)
- Phase 3: 4 turns (one per tab — they're substantial)
- Phase 4: 3-5 turns (depends on what's broken)

Approve the plan and I'll start with Phase 1 (database migration + cross-bank edge functions). Reply with adjustments if you want to reorder, drop anything, or change the threshold.
