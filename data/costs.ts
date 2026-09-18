// What a buyer pays to RUN the pipeline after the one-time purchase.
//
// The per-image figures are the published fal.ai rates for the four models
// the pipeline calls (same numbers as data/models.ts — keep them in sync).
// Everything else is a third-party account the buyer brings themselves, so
// re-check these against the vendors' current pricing before launch; they
// are outside our control and they do change.

export interface CostLine {
  service: string;
  purpose: string;
  cost: string;
}

export const RUNNING_COSTS: CostLine[] = [
  {
    service: "fal.ai",
    purpose: "Generates the images — billed per image, varies by model",
    cost: "$0.01–$0.15",
  },
  {
    service: "Notion",
    purpose: "Stores the log of every generation",
    cost: "Free plan is enough",
  },
  {
    service: "Google Drive",
    purpose: "Stores the finished images",
    cost: "Free tier is enough",
  },
  {
    service: "n8n",
    purpose: "Runs the pipeline itself",
    cost: "Free if self-hosted",
  },
];

// A concrete, checkable example rather than a vague "pennies per image".
// Uses Nano Banana Pro ($0.15) — deliberately the most expensive of the four
// models, so the number is a ceiling rather than a best case.
export const COST_EXAMPLE = {
  label: "A 50-shot lookbook",
  detail: "50 images on Nano Banana Pro — the highest-fidelity of the four models",
  total: "≈ $7.50",
  // NOTE: the obvious next line here is a comparison against what the same
  // shoot costs locally (studio + model + photographer day rate). Deliberately
  // left out rather than guessed at — drop in a real figure for your market
  // and this section becomes the strongest argument on the page.
  note: "That's the model fee, paid directly to fal.ai — per generation attempt, not per guaranteed keeper. Nothing recurring comes to us.",
};
