export const SITE = {
  name: "AI Image Generation Pipeline",
  brand: "Poshak AI",
  builtBy: "360 Synergy Tech",
  hero: {
    eyebrow: "n8n · fal.ai · Notion",
    headline: "Turn flat product photos into campaign-ready model shots",
    subheadline:
      "One self-serve pipeline routes your prompt to 4 AI image models, tracks every request in Notion, and delivers photorealistic on-model imagery — no photoshoot required.",
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
  howItWorks: {
    eyebrow: "Architecture",
    heading: "Two webhook, four models, zero babysitting",
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
