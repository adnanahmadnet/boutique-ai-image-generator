import {
  IconHistory,
  IconShieldCheck,
  IconRefresh,
  IconFileCode,
  type Icon,
} from "@tabler/icons-react";

export interface Feature {
  title: string;
  description: string;
  icon: Icon;
}

export const FEATURES: Feature[] = [
  {
    title: "Full audit log",
    description:
      "Every request — prompt, model, params, cost, output links, timing — is written to a Notion database automatically. Nothing happens off the record.",
    icon: IconHistory,
  },
  {
    title: "Self-healing on failure",
    description:
      "A dedicated error-handling workflow watches for crashed runs and marks them Error in Notion instead of leaving them stuck at Processing forever.",
    icon: IconShieldCheck,
  },
  {
    title: "Async-safe by design",
    description:
      "A front-loaded polling loop (60s initial wait, then every 30s, up to ~6 minutes) checks status without hammering the queue or blocking the UI.",
    icon: IconRefresh,
  },
  {
    title: "Zero-build front end",
    description:
      "The operator console is a single static HTML file. No npm install, no server required to run it — host it anywhere or open it locally.",
    icon: IconFileCode,
  },
];
