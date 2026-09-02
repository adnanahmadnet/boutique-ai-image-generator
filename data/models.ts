import {
  IconSparkles,
  IconWand,
  IconPhoto,
  IconZoomIn,
  type Icon,
} from "@tabler/icons-react";

export type ModelMode = "async" | "sync";

export interface PipelineModel {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  mode: ModelMode;
  latency: string;
  icon: Icon;
}

export const MODELS: PipelineModel[] = [
  {
    slug: "nano-banana-pro",
    name: "Nano Banana Pro",
    tagline: "Highest-fidelity edits and on-model generations",
    price: "$0.15",
    priceNote: "per image",
    mode: "async",
    latency: "~120s",
    icon: IconSparkles,
  },
  {
    slug: "flux-kontext-pro",
    name: "FLUX.1 Kontext [pro]",
    tagline: "Fast, cheap context-aware edits",
    price: "$0.04",
    priceNote: "per image",
    mode: "async",
    latency: "~60s",
    icon: IconWand,
  },
  {
    slug: "gpt-image-2",
    name: "GPT Image 2",
    tagline: "Synchronous generation, quality-tunable",
    price: "$0.01–$0.41",
    priceNote: "by quality + resolution",
    mode: "sync",
    latency: "seconds",
    icon: IconPhoto,
  },
  {
    slug: "topaz-upscaler",
    name: "Topaz Upscaler",
    tagline: "Clean upscales for print and hero imagery",
    price: "~$0.05",
    priceNote: "per megapixel",
    mode: "sync",
    latency: "seconds",
    icon: IconZoomIn,
  },
];
