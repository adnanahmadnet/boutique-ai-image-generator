@AGENTS.md

# Project state — read this before doing anything

This file exists so a fresh agent session can pick up exactly where the
previous one left off. It's updated as work happens — if you make a
significant change, update the relevant section below rather than leaving
this file stale.

## What this project is

**PixelCore Engine** (renamed from "Poshak AI" — that name is not affiliated
with this product and should never reappear) — a marketing site + buyer/
admin/support dashboard for a boutique's AI photoshoot pipeline. The actual
product being sold is an **n8n workflow pipeline** (webhook intake → 4 AI
image models → Notion logging → Google Drive delivery) plus an operator
console (`Image Generation Launcher.html`, a single static file) — not a
hosted SaaS. Buyers run it on their own n8n instance and pay the AI model
vendor (fal.ai) directly per generation.

**Business model (from the client, not just guessed):** the pipeline itself
is priced cheap ($30, one-time) — that is *not* the profit center. The real
revenue is **paid support** (a $20 add-on at checkout, or arranged
separately): setup, customization, deployment, even running a photoshoot for
the customer. Site copy should keep support generic ("available based on
what you need"), never an itemized service menu — that was an explicit
instruction. A teammate ("Ana(s)") was going to send real western-wear
generated photos to eventually replace the gradient/stock placeholders in
the homepage style-showcase carousel — check if those have arrived before
assuming the placeholders are still needed.

Built by 360 Synergy Tech. Owner/admin is Ibtasam Amjad.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- **This is a modified Next.js with breaking changes vs. your training
  data** — see the `@AGENTS.md` import at the top of this file (auto-managed
  by `next dev`, do not hand-edit its content). One concrete example already
  hit: **middleware.ts is renamed to `proxy.ts`** (exports a `proxy()`
  function, not `middleware()`). Check `node_modules/next/dist/docs/` before
  assuming any other API works the way you remember.
- Postgres via raw `pg` (no ORM) — all queries are hand-written SQL through
  `lib/db.ts`'s `query()`/`queryOne()`. `isDatabaseConfigured()` gates
  everything DB-related; most routes/pages degrade gracefully (not crash)
  when `DATABASE_URL` is unset.
- PayPal (`@paypal/react-paypal-js`) — integration is fully built and was
  sandbox-tested, but is currently **dormant** (see "Payment status" below).
- Resend for transactional email (`lib/email.tsx`).
- No design/testing framework beyond `tsc --noEmit` and `eslint` — there is
  no test suite. **Always run both after changes:**
  ```
  npx tsc --noEmit -p tsconfig.json
  npx eslint .
  ```

## Three separate login identities — this is the core architectural fact of the whole app

There is no single "users with roles" table. Three completely independent
identities, each with its own DB table, its own session table, its own
cookie, and its own `getCurrent*()` helper (each wrapped in React `cache()`
for per-request memoization):

| Identity | Table | Session table | Cookie | Helper |
|---|---|---|---|---|
| Buyer | `public.users` | `public.sessions` | `session_token` | `lib/get-current-user.ts` |
| Admin | `public.admins` | `public.admin_sessions` | `admin_session_token` | `lib/get-current-admin.ts` |
| Support agent | `public.support_agents` | `public.support_sessions` | `support_session_token` | `lib/get-current-support-agent.ts` |

- **`public.admins` is capped at exactly one row**, enforced at the DB level
  (a `singleton boolean not null default true check (singleton)` column plus
  a unique index on it — see `db/migrations/0003_separate_admin_table.sql`).
  There is no admin signup. Create/rotate the one admin via
  `ADMIN_EMAIL=... ADMIN_PASSWORD=... node db/seed-admin.mjs` (idempotent —
  updates the existing row if one exists).
- **`public.support_agents` has no cap.** Created only by the admin, from
  `/admin/support-team` (form → `POST /api/admin/support-agents`). No public
  signup path. Has an `is_active` flag — deactivating (not deleting)
  preserves their assignment history on `support_requests`.
- **Public `/signup` can only ever create a buyer.** It explicitly checks
  for an email collision against both `public.admins` and
  `public.support_agents` before inserting, so no email can accidentally
  end up in two identity tables.
- **Login is one shared form/endpoint** (`app/api/auth/login/route.ts`)
  checking all three tables in order: admin → support agent → buyer. It
  returns `{ isAdmin, isSupport }` so the client (`PasswordAuthForm.tsx`)
  knows which dashboard to redirect to.
- **`proxy.ts`** (this project's middleware) gates `/dashboard`, `/admin`,
  `/support` by cookie *presence only* (Edge can't reach Postgres) —
  redirects to `/login?redirectTo=<path>` if the relevant cookie is
  missing. The **real** auth check (cookie validity + expiry) happens in
  each route group's `layout.tsx`, calling the matching `getCurrent*()`.
- **`lib/get-current-viewer.ts`** — a newer helper that resolves whichever
  of the three is active (admin → support → buyer priority) for use on
  *public* marketing pages. This exists because the marketing Header/Hero
  used to call `getCurrentUser()` alone, which made an admin or support
  agent look logged-out the moment they visited the homepage (e.g. by
  clicking their own dashboard's logo). Use `getCurrentViewer()` — not
  `getCurrentUser()` — anywhere on a public page that needs to know "is
  *anyone* logged in and where's their dashboard."
- **`/login` and `/signup` redirect an already-authenticated visitor**
  (any of the three) straight to their own dashboard rather than showing
  the form — deliberately ignoring `redirectTo` in that case to avoid a
  redirect loop (a buyer hitting `/login?redirectTo=/admin` would otherwise
  bounce back here forever).
- **Checkout requires a logged-in buyer** (interim checkout and the dormant
  PayPal `create-order` both return 401 `{loginRequired: true}` otherwise;
  the order always uses the account's own email/`buyer_id`, never a typed
  one). The pricing page sends a logged-out visitor to
  `/login?redirectTo=/pricing`. Guest orders (`buyer_id = null`, matched by
  `buyer_email`) can no longer be created, but `lib/auth-claim.ts`'s
  `claimGuestOrders(userId, email)` still runs on login/signup to link any
  pre-existing ones.

## Payment status — read this before touching checkout

**Live PayPal payment is not enabled.** `components/PayPalCheckout.tsx` has
a `PAYMENTS_ENABLED = false` constant at the top. The *entire* real PayPal
flow (`CheckoutForm` → `PayPalButtons` → `/api/paypal/create-order` →
`/api/paypal/capture-order` → `/api/webhooks/paypal` → license + email) is
still there, untouched, and was sandbox-tested working — flipping that one
constant back to `true` re-enables it with no other code changes needed.

While it's off, checkout goes through **`app/api/orders/interim-checkout/route.ts`**
instead: takes an email + a support-addon checkbox, immediately creates a
`completed` order + license (no payment collected), creates a
`support_requests` row if the addon was checked, and emails the team via
`sendContactNotificationEmail` so a human follows up to actually collect
payment. This is a deliberate stand-in, not a bug — the code comments in
that file say so. **If/when real PayPal goes live, this interim route
should probably be retired** (or at least stop being the default path) and
`PAYMENTS_ENABLED` flipped to `true`.

Current price: **$30** base (`data/pricing.ts` → `PRICING.amount`) + **$20**
optional support add-on (`SUPPORT_ADDON`). Both are real, current, not
placeholders — `PRICING.amount` used to be a `$149 TODO` placeholder, that
was resolved this session.

## Database — full table list and migration order

**The database is hosted on Supabase** (project ref `kytqoiatltcjieukxzim`,
region ap-northeast-2), reached as plain Postgres through `DATABASE_URL` —
no Supabase client library or auth is used. It **must be a pooler string**
(`postgres.<ref>@aws-0-<region>.pooler.supabase.com`), and the **Transaction
pooler (port 6543) is the right one for the app** — Session mode (5432) caps
at 15 clients total and hit `EMAXCONNSESSION` once. The app only uses plain
`pool.query()` (no named prepared statements/advisory locks), so
transaction mode is safe. The "Direct connection" host is IPv6-only and
fails from Vercel and most IPv4 networks. `lib/db.ts` enables SSL for any
non-localhost host, caches the pool on `globalThis` (dev HMR would otherwise
leak pools) and caps it at `max: 3`. The same `DATABASE_URL` must be set in
Vercel's env vars for the deployed site.

Apply migrations **in order** with the runner (idempotent — tracks applied
files in `public.schema_migrations`, one transaction per file):
```
node db/migrate.mjs
```
**The paid download zip is stored in `public.deliverables`** (migration
0008), not shipped with the deploy — `private/downloads/*` is git-ignored on
purpose, so it doesn't exist on Vercel. `/api/download` reads it from the DB
(falling back to the local file in dev). After changing the zip, re-run
`node db/upload-deliverable.mjs`. Download links from the dashboard are
relative (`/api/download?token=…`); `getSiteUrl()` (emails/webhooks) falls
back to the Vercel production domain if `NEXT_PUBLIC_SITE_URL` is missing
or localhost.

`0007_enable_rls.sql` turns on RLS for every table because Supabase exposes
`public` through its REST API; the app's `postgres` role bypasses it. **Any
new table needs `enable row level security` in its migration.**

| Migration | What it does |
|---|---|
| `0001_init.sql` | Base schema: `users`, `sessions`, `profiles` (created but unused until 0005), `orders`, `licenses`, `download_grants`, `contact_messages`, `rate_limit_hits`, `webhook_events` |
| `0002_add_is_admin.sql` | Adds `users.is_admin` (superseded/removed by 0003 — historical only) |
| `0003_separate_admin_table.sql` | Fixes the is_admin-flag bug by creating `public.admins` (singleton-enforced) + `public.admin_sessions`, migrates the one bootstrap admin over, drops `users.is_admin` |
| `0004_support_team.sql` | Adds `support_agents`, `support_sessions`, `orders.includes_support` (replacing an amount-based heuristic), `support_requests` (claim → schedule → done workflow), backfills existing completed+support orders |
| `0005_profile_contact_info.sql` | Adds `profiles.phone` — wires up the previously-dead `profiles` table to signup, for the support team to actually reach a buyer |
| `0006_internal_user_flag.sql` | Adds `users.is_internal` — lets the admin hide their own/team's test buyer accounts from the customer-facing `/admin/users` list without deleting them |

**⚠️ Migrations 0004, 0005, 0006 have only been applied to the local dev
database.** They have NOT been run against production. Whoever deploys next
must run all three (in order) against the production `DATABASE_URL` first,
or the new admin/support/signup code will error against a stale schema.

Full current table list (14): `admins`, `admin_sessions`, `users`,
`sessions`, `profiles`, `support_agents`, `support_sessions`,
`support_requests`, `orders`, `licenses`, `download_grants`,
`contact_messages`, `rate_limit_hits`, `webhook_events`.

**Known local-dev data** (not real customers — do not assume any of this
exists in production, and don't treat it as sacred if it gets in the way,
except where noted):
- `admins`: one row, `iqbalamjad36@gmail.com` / "Ibtasam Amjad" — the real
  admin.
- `users`: `user@gmail.com` (marked `is_internal = true` — this is the
  admin's own test buyer account), `admin@gmail.com` and `user2@gmail.com`
  (both clearly leftover test data too, **not yet marked internal** — worth
  doing if they keep showing up in the customer list).
- `support_agents`: `support@cyg.com` / "Support" — **this is real, created
  by the actual admin using the feature, not test data.** Do not delete or
  reset without being asked. (Any `test-agent@example.com` /
  `test-contact@example.com` rows were my own throwaway test accounts and
  should already be cleaned up — if you see one, it's safe to remove.)

## Feature inventory (what's built, as of this file's last update)

**Marketing site** (`app/(marketing)/`):
- Homepage: Hero, fan-carousel style showcase (cursor-scrub + click-to-zoom
  on real generated photos, `components/FanCarousel.tsx`), combine demo,
  console walkthrough ("Full creative control over the prompt"), models,
  running costs (clarified: per generation *attempt*, not a guaranteed
  usable image), setup requirements, pricing teaser, testimonials (empty by
  design — no fabricated quotes).
- Nav: Home / Features / Gallery / Pricing / FAQ. Contact is footer-only,
  not in the top nav (never explicitly asked to add it there).
- Pricing page: $30 base + $20 support-add-on checkbox with live total,
  "Continue" → (logged out: redirected to `/login?redirectTo=/pricing`;
  the login page's "Create an account" link keeps the redirect) → logged in:
  interim-checkout → success message (mentions "our support team will
  contact you shortly" only if the add-on was checked) → "Go to dashboard".
- Signup form: name, **phone (required)**, boutique name (optional), email,
  password. Phone is stored in `profiles.phone` specifically so the support
  team can actually call a buyer, not just email them.

**Buyer dashboard** (`app/(dashboard)/dashboard/`): Resources/downloads,
Orders (shows the single completed order — if any — as a detail card, not a
table; this is a one-time-purchase product so a buyer essentially never has
more than one), Contact.

**Admin dashboard** (`app/(admin)/admin/`):
- Overview: signups/orders/revenue/messages stats + a "Support requests"
  section (Unclaimed/Scheduled/Done counts) linking to Support Team.
- Users: list with Phone column, hides `is_internal = true` rows by default
  (toggle to show them); detail page has Phone/Boutique info rows, an
  "Internal test account" toggle, and delete-user.
- Orders: Support column + two independent filter-pill rows (Paid: All/
  Paid/Not paid; Support: All/Wants support/No support), URL-param-driven,
  no client JS.
- **Support Team** (new): create support accounts (name/email/password),
  activate/deactivate existing ones, read-only table of every support
  request across the whole team (buyer, phone, status, assigned agent,
  scheduled/completed dates).
- Contact: unchanged from before this work.

**Support dashboard** (`app/(support)/support/`, new): every support
request as a card, filterable by status. Unclaimed → pick a date/time,
claim it. Scheduled by you → "Mark as Support done" with optional notes.
Scheduled by someone else → read-only (no double-booking). Done → shows who
closed it and their notes. Phone number is a clickable `tel:` link on every
card — this page exists specifically so the support team can find who to
call.

## Deployment

- **GitHub**: this repo is pushed to `IbtasamAmjad/boutique-ai-image-generator`
  (private) — remote name `new-origin` in this local clone. There's also an
  `origin` remote pointing to a *different*, earlier repo
  (`Saadullah128/boutique-ai-image-generator`) — that one is not being used
  going forward; don't push there by mistake (double-check `git remote -v`
  and use `new-origin` / whatever `origin` has been repointed to since).
- **Vercel**: deployed at `boutique-ai-image-generator.vercel.app` under
  account `ibtasamamjad`, connected via GitHub integration to the
  `new-origin` repo's `main` branch — pushes there auto-deploy.
- **Required env vars** (see `.env.example`): `DATABASE_URL`,
  `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`NEXT_PUBLIC_PAYPAL_CLIENT_ID`
  (currently unused since `PAYMENTS_ENABLED = false`, but still needed for
  the dormant live-flow code to not crash if ever flipped on),
  `RESEND_API_KEY`/`RESEND_FROM_EMAIL`, `CONTACT_INBOX_EMAIL`,
  `NEXT_PUBLIC_SITE_URL`. Production has these set already (as of the last
  deploy) — verify before assuming they're missing.
- `.env.example`'s migration list comment only mentions up to 0003 — it's
  stale, update it if you touch that file again.

## Current session state — uncommitted work

As of this file being written, **none of the identity/support-team/contact-
info/redirect work described above is committed to git.** `git status`
shows a large set of modified + new files (support-team feature end to end,
signup contact fields, the `getCurrentViewer` header fix, the internal-user
flag, login/signup redirect guards). The last actual commit was
`5d1213c — Rename to PixelCore Engine, add interim checkout flow, and fix
content`. **Check `git status` before assuming the working tree matches
what's on GitHub/Vercel** — there's a real gap right now. Don't commit/push
without the user asking first, per their established preference this
session, but don't be surprised the tree is dirty either.

## Conventions and gotchas learned this session

- **Tailwind v4**: use `bg-linear-to-*`, not the deprecated `bg-gradient-to-*`
  (both compile, but the canonical name changed).
- **Design system tokens** (from `app/globals.css`): dark theme,
  `bg-bg`/`bg-surface`/`bg-surface-2`, `text-text`/`text-text-muted`/
  `text-text-dim`, `bg-accent`/`text-accent`/`bg-accent-dim` (gold, `#f5c842`),
  `border-border`/`border-border-hover`, `rounded-default`/`rounded-lg`,
  fonts via `font-heading`/`font-body`/`font-mono`. Match existing
  component patterns (e.g. `StatusBadge` + `STATUS_STYLES` record) rather
  than inventing new ones — yes, it's duplicated across a few files
  (admin orders, admin user detail, buyer OrderDetail) rather than shared;
  that's the existing style, not an oversight to "fix" unprompted.
- **All list/filter pages are server components using URL search params**
  for filters (no client-side filter state anywhere) — e.g. admin Orders'
  `?paid=yes&support=no`, admin Users' `?internal=show`, support dashboard's
  `?status=scheduled`. Keep using this pattern for new filters.
- **Rate limiting** (`lib/rate-limit.ts`) is DB-backed and fails *open* — if
  you add a new mutating endpoint that takes user input, add a
  `checkRateLimit()` call matching the pattern in existing routes.
- **Browser-automation testing note**: coordinate-based `click` then `type`
  on React-controlled inputs is unreliable in this environment (silently
  lands in the wrong field or loses focus) — prefer `find` to get an
  element ref, then `form_input` with that ref. This was the cause of a
  couple of false "bugs" this session that turned out to be testing
  artifacts, not real issues — verify twice before concluding the app is
  broken.
- **Never delete/reset data during testing without checking whose it is
  first.** This session nearly reset a real support-agent's real scheduled
  request, thinking it was test debris — always check `created_at` /
  context against what you actually did versus what predates your session.
- Can't log in as the real admin without their password (not stored/known
  by the agent) — for testing admin-gated features, insert a temporary
  test row directly via SQL (support agent, etc.), test through it, then
  clean up **only that row**.
