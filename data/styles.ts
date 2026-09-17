import type { GalleryImage } from "@/data/gallery";

// One card in the homepage fan carousel. `image` is optional so a style can
// ship with a gradient placeholder until a dedicated generated photo for
// that exact look exists.
export interface StyleCard {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  gradient: string;
  image?: GalleryImage;
}

export const STYLE_CARDS: StyleCard[] = [
  {
    id: "studio-light",
    title: "Studio Light",
    subtitle: "Clean backdrop, soft key light",
    tag: "Studio",
    gradient: "from-slate-400 via-slate-300 to-slate-500",
    image: {
      src: "/images/gallery/outfit-generated.jpg",
      alt: "AI-generated on-model photo of a printed shirt and trousers, shot on a clean studio backdrop",
      width: 1400,
      height: 2508,
    },
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    subtitle: "Warm outdoor editorial glow",
    tag: "Outdoor",
    gradient: "from-amber-500 via-orange-400 to-amber-600",
    image: {
      src: "/images/gallery/lehenga-output.jpg",
      alt: "AI-generated on-model photo of an embroidered lehenga with a warm editorial glow",
      width: 893,
      height: 1600,
    },
  },
  {
    id: "street-edit",
    title: "Street Edit",
    subtitle: "Urban lifestyle, candid energy",
    tag: "Lifestyle",
    gradient: "from-zinc-500 via-zinc-400 to-zinc-600",
    image: {
      src: "/images/gallery/look-generated.jpg",
      alt: "AI-generated on-model photo of a grey embroidered kurta with black leather shoes",
      width: 1400,
      height: 2508,
    },
  },
  {
    id: "night-editorial",
    title: "Night Editorial",
    subtitle: "Moody, high-contrast fashion",
    tag: "Editorial",
    gradient: "from-red-600 via-rose-500 to-red-700",
    image: {
      src: "/images/gallery/lehenga-output-alt.jpg",
      alt: "AI-generated on-model photo of the embroidered lehenga from a second, moodier angle",
      width: 893,
      height: 1600,
    },
  },
  {
    id: "minimal-set",
    title: "Minimal Set",
    subtitle: "Neutral tones, negative space",
    tag: "Minimal",
    gradient: "from-violet-500 via-purple-400 to-violet-600",
  },
];
