export const SITE = {
  name: "AI Image Generation Pipeline",
  brand: "Poshak AI",
  builtBy: "360 Synergy Tech",
  hero: {
    eyebrow: "Built for boutiques",
    headline: "Turn flat product photos into campaign-ready model shots",
    subheadline:
      "Upload the garment, pick the look, and get a photorealistic on-model shot back in about two minutes — for a few cents an image, without booking a studio, a model or a photographer.",
    ctaLabel: "Get Access",
    ctaHref: "/pricing",
    secondaryLabel: "See how it works",
    secondaryHref: "#how-it-works",
  },
  gallery: {
    eyebrow: "Real output",
    heading: "From the rack to the runway — automatically",
    subheading:
      "Every image below was produced by this exact pipeline. No re-shoots, no studio booking, no models on retainer.",
  },
  combineDemo: {
    eyebrow: "See it happen",
    heading: "Three pieces become one photoshoot",
    subheading:
      "A shirt, a pair of pants, and a reference pose go in — the pipeline merges them into one photorealistic, on-model shot.",
  },
  console: {
    eyebrow: "Not technical? Good.",
    heading: "You only ever use one screen",
    subheading:
      "Setup happens once. After that you never open n8n again — you work in a single page: pick a profile, drop in your photos, write the prompt, generate.",
  },
  costs: {
    eyebrow: "Running costs",
    heading: "What it costs after you own it",
    subheading:
      "You pay the image model directly — there's no ongoing fee to us. Here's every account involved and what each one actually costs.",
  },
  setup: {
    eyebrow: "Before you start",
    heading: "What you'll need to set it up",
    subheading:
      "Four accounts, all of which you keep control of. No coding — you import two files and paste in your own keys.",
  },
  howItWorks: {
    eyebrow: "Architecture",
    heading: "Two webhooks, four models, zero babysitting",
    subheading:
      "Built on n8n so the whole pipeline is inspectable, forkable, and yours to run — not a black-box SaaS.",
  },
  models: {
    eyebrow: "Model routing",
    heading: "Four models. One interface.",
    subheading:
      "The pipeline normalizes four very different APIs — different auth, different pricing, different sync behavior — into one uniform request/response contract.",
  },
  features: {
    eyebrow: "Engineering",
    heading: "Built to not fall over",
    subheading:
      "The unglamorous parts that make this safe to hand to a non-technical team.",
  },
  pricing: {
    eyebrow: "Get access",
    heading: "Own the full pipeline",
    subheading:
      "One-time payment. Import it into your own n8n instance and point it at your own accounts.",
  },
  footer: {
    note: "Payments processed securely via PayPal.",
  },
} as const;
