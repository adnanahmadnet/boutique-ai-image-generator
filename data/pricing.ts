// PLACEHOLDER — price and included-items list are not finalized.
// Confirm final figures before going live; swap PAYPAL env vars from sandbox to live credentials at the same time.
export const PRICING = {
  currency: "USD",
  amount: "149.00", // TODO: confirm real price
  label: "One-time purchase",
  planName: "AI Image Generation Pipeline — Full Package",
  includes: [
    "Main n8n workflow (webhook intake, 4-model routing, Notion logging)",
    "Error-handling n8n workflow (self-healing status watcher)",
    "Operator console (nano-banana-launcher.html, no build step)",
    "Notion database CSV template",
    "Setup & architecture write-up",
  ],
} as const;
