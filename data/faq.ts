export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What exactly do I get when I buy this?",
    answer:
      "The full pipeline: the operator console (a single HTML file, no build step), the two n8n workflow files (main pipeline + error handler), a Notion database template, and the setup write-up — everything needed to run it yourself.",
  },
  {
    question: "What accounts do I need to run it myself?",
    answer:
      "Your own n8n instance (Cloud or self-hosted), a fal.ai API key (used by all four models), a Google Drive account for storing generated images, and a Notion workspace for logging. None of these are included in the purchase — they're separate accounts you control.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "No coding required. You'll import two JSON files into n8n and paste in your own API credentials — the setup guide walks through each step.",
  },
  {
    question: "What does it cost to run after I buy it?",
    answer:
      "You pay fal.ai directly per image generated (see the Models section on the Features page for current per-model pricing), plus whatever your n8n hosting plan costs if you're not self-hosting. There's no ongoing fee to us beyond the one-time purchase.",
  },
  {
    question: "Is the license key required to use the tool?",
    answer:
      "No — your license key is an entitlement and support reference shown in your dashboard, not a technical activation key. The launcher and workflow files don't check it. Dashboard access is protected by your account login instead.",
  },
  {
    question: "What's your refund policy?",
    answer: "See the Terms & Refund Policy page for the current policy.",
  },
  {
    question: "I bought this but haven't set up an account — how do I get to my download?",
    answer:
      "Your confirmation email includes a direct download link (it expires after a short window) and your license key. To create dashboard access at any time, go to Login and enter the same email you purchased with — you don't need a password.",
  },
];
