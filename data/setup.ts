// The accounts a buyer needs before the pipeline will run, stated up front
// rather than left to be discovered after purchase. Mirrors the Prerequisites
// section of the pipeline's own README — keep the two in step.

export interface SetupRequirement {
  name: string;
  purpose: string;
  note: string;
}

export const SETUP_COMPLEXITY = {
  level: "Beginner-friendly",
  detail:
    "No coding. You import two files into n8n, paste in your own API keys, and point the console at your webhook — the written guide walks through every step.",
};

export const SETUP_REQUIREMENTS: SetupRequirement[] = [
  {
    name: "n8n",
    purpose: "Runs the pipeline",
    note: "Cloud or self-hosted — your choice",
  },
  {
    name: "fal.ai",
    purpose: "Generates the images",
    note: "One API key covers all four models",
  },
  {
    name: "Notion",
    purpose: "Logs every generation",
    note: "Free plan is enough",
  },
  {
    name: "Google Drive",
    purpose: "Stores finished images",
    note: "Free tier is enough",
  },
];
