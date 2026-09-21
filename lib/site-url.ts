// Absolute origin used in emails and webhook-generated links. On Vercel, a
// missing or localhost NEXT_PUBLIC_SITE_URL (a common leftover from copying
// .env.local) falls back to the project's real production domain instead of
// sending buyers to http://localhost:3000.
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const looksLocal = !configured || /localhost|127\.0\.0\.1/.test(configured);
  const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (process.env.VERCEL && looksLocal && vercelDomain) {
    return `https://${vercelDomain}`;
  }
  return configured ?? "http://localhost:3000";
}
