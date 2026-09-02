# AI Image Generation Pipeline — Sales Website

Next.js (App Router) marketing site + buyer dashboard for the [AI Image Generation pipeline](./AI%20Image%20generation/README.md). Markets the pipeline with real before/after output, sells one-time access via PayPal, and delivers the toolkit through an authenticated buyer dashboard with license keys and expiring download links.

Built against `docs/AI-Image-Generator-Boutique-Website-Plan.docx` — see `.claude` plan history for the full gap analysis and architecture writeup.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required infrastructure

This app needs three external services configured before its core flows work end-to-end. Without them, pages render with clear "not configured" placeholders instead of crashing (see `lib/supabase/env.ts`'s `isSupabaseConfigured()` and the same pattern in `PayPalCheckout.tsx`/`MagicLinkForm.tsx`).

### 1. Supabase (accounts, orders, licenses, downloads, rate limiting)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/0001_init.sql` against it (Supabase Studio SQL editor, or `supabase db push` if using the CLI).
3. Copy the Project URL, `anon` key, and `service_role` key from **Project Settings → API** into `.env.local` (see `.env.example`).
4. Under **Authentication → Providers**, ensure Email is enabled with **Magic Link** (no password) sign-in.

### 2. PayPal (checkout + webhooks)

1. Create a Sandbox REST API app at [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox) — copy the Client ID and Secret into `.env.local`.
2. Under the app's **Webhooks**, add an endpoint pointed at `<your-site>/api/webhooks/paypal`, subscribed to at least `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, and `PAYMENT.CAPTURE.REFUNDED`. Copy the generated Webhook ID into `PAYPAL_WEBHOOK_ID`.
3. Swap `PAYPAL_API_BASE` to `https://api-m.paypal.com` and use live credentials only after a full Sandbox test.

### 3. Resend (transactional email — optional, degrades gracefully)

1. Create an account at [resend.com](https://resend.com), verify a sending domain, and copy an API key into `RESEND_API_KEY`.
2. Set `RESEND_FROM_EMAIL` to a verified address and `CONTACT_INBOX_EMAIL` to where contact-form alerts should land.
3. Without these set, order/license creation still succeeds — the app logs a warning and skips sending, matching `lib/email.tsx`'s never-block-the-order design.

## Environment variables

See `.env.example` for the full list with inline comments. Copy it to `.env.local` and fill in real values as you configure each service above.

## The purchasable deliverable

`private/downloads/ai-image-generation-pipeline.zip` (outside `public/`, only reachable through the token-gated `/api/download` route after a verified payment) currently bundles the launcher HTML, both n8n workflow JSONs, the Notion CSV template, and the README — confirm this is the intended final contents before launch.

## Known placeholders — confirm before launch

- **Price & currency** — `data/pricing.ts` ($149.00 USD).
- **Support email, refund window, entity name** — `data/legal.ts`.
- **Testimonials** — `data/testimonials.ts` is intentionally empty; do not add fabricated quotes. Add real ones as they come in.
- **Brand name** — "Poshak AI" in `data/site.ts`; confirm if final.

## Notes

- Payment is wired to **PayPal Sandbox**; the webhook handler (`app/api/webhooks/paypal/route.ts`) is the sole source of truth for granting access — client-side capture is a UX fast-path only.
- License keys (`lib/license.ts`) are entitlement/support records, not technically-enforced activation keys — nothing in the delivered ZIP validates them.
- Download links are DB-backed (`download_grants` table), expire in 30 minutes, and are revoked automatically if an order is refunded.
- Rate limiting (`lib/rate-limit.ts`) is a Postgres-backed windowed counter, applied to login, download, reissue, contact, and checkout endpoints. It fails open if Supabase isn't configured.
