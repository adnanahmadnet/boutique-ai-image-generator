export interface Stat {
  label: string;
  value: string;
}

export const STATS: Stat[] = [
  { value: "4", label: "AI models, one interface" },
  { value: "$0.01–$0.15", label: "per image" },
  { value: "~60–120s", label: "typical turnaround" },
  { value: "100%", label: "logged to Notion" },
];
