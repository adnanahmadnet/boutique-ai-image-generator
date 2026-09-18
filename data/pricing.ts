// Included-items list is still a placeholder — confirm before going live.
// Swap PAYPAL env vars from sandbox to live credentials once everything here is final.
export const PRICING = {
  currency: "USD",
  amount: "30.00",
  label: "One-time purchase",
  planName: "PixelCore Engine — Full Package",
  includes: [
    "Main n8n workflow (webhook intake, 4-model routing, Notion logging)",
    "Error-handling n8n workflow (self-healing status watcher)",
    "Operator console (Image Generation Launcher.html, no build step)",
    "Notion database CSV template",
    "Setup & architecture write-up",
  ],
} as const;

// Optional add-on offered right at checkout — the real business model for
// now: the pipeline itself is priced to move, support is where the money is.
export const SUPPORT_ADDON = {
  amount: "20.00",
  label: "Setup & customization support",
  description:
    "We'll get it running, customize it for your catalog, and can even run a photoshoot for you.",
} as const;
