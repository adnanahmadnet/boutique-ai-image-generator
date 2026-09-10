export interface Stat {
  label: string;
  value: string;
}

export const STATS: Stat[] = [
  { value: "6", label: "ready-made profiles" },
  { value: "$0.01–$0.15", label: "per image" },
  { value: "~60–120s", label: "typical turnaround" },
  { value: "4", label: "AI models, one interface" },
];
