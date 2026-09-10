export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const HERO_PAIR: { before: GalleryImage; after: GalleryImage } = {
  before: {
    src: "/images/gallery/lehenga-input.jpg",
    alt: "Flat-lay product photo of an embroidered lehenga on a mannequin",
    width: 794,
    height: 1600,
  },
  after: {
    src: "/images/gallery/lehenga-output.jpg",
    alt: "AI-generated photorealistic model wearing the same embroidered lehenga",
    width: 893,
    height: 1600,
  },
};

export interface CombineDemoData {
  shirt: GalleryImage;
  pant: GalleryImage;
  pose: GalleryImage;
  result: GalleryImage;
}

export const COMBINE_DEMO: CombineDemoData = {
  shirt: {
    src: "/images/gallery/outfit-shirt.jpg",
    alt: "Flat-lay product photo of a printed short-sleeve shirt",
    width: 1000,
    height: 1500,
  },
  pant: {
    src: "/images/gallery/outfit-pant.jpg",
    alt: "Flat-lay product photo of grey tailored trousers",
    width: 1000,
    height: 1599,
  },
  pose: {
    src: "/images/gallery/outfit-pose.jpg",
    alt: "Reference photo of a model in the target pose",
    width: 1000,
    height: 1400,
  },
  result: {
    src: "/images/gallery/outfit-generated.jpg",
    alt: "AI-generated photorealistic model wearing the shirt and trousers in the reference pose",
    width: 1400,
    height: 2508,
  },
};

// One fully documented generation: every file that went in, plus where each
// one landed in the result (as a percentage of the result frame). Drives the
// numbered callout pins in CombineBreakdown — if the result image is ever
// re-cropped or replaced, re-check every `pin` here.
export interface ProvenanceSource {
  image: GalleryImage;
  label: string;
  role: string;
  pin: { left: number; top: number };
}

export interface ProvenanceExample {
  title: string;
  result: GalleryImage;
  sources: ProvenanceSource[];
}

export const PROVENANCE_EXAMPLES: ProvenanceExample[] = [
  {
    // Reuses the same files the hero animation combines (COMBINE_DEMO), so
    // the two never drift apart.
    title: "Western — a shirt, trousers and a pose",
    result: COMBINE_DEMO.result,
    sources: [
      {
        image: COMBINE_DEMO.shirt,
        label: "Shirt",
        role: "Product photo — print, drape, collar",
        pin: { left: 46, top: 33 },
      },
      {
        image: COMBINE_DEMO.pant,
        label: "Trousers",
        role: "Product photo — cut, fabric, colour",
        pin: { left: 50, top: 66 },
      },
      {
        image: COMBINE_DEMO.pose,
        label: "Pose reference",
        role: "Model, stance, camera angle",
        // Sits just off the head rather than over the face.
        pin: { left: 59, top: 10 },
      },
    ],
  },
  {
    title: "Eastern — a kurta, shoes, a face and a pose",
    result: {
      src: "/images/gallery/look-generated.jpg",
      alt: "AI-generated photorealistic model wearing the grey embroidered kurta and black leather shoes, in the reference pose",
      width: 1400,
      height: 2508,
    },
    sources: [
      {
        image: {
          src: "/images/gallery/look-face.jpg",
          alt: "Reference headshot establishing the model's face",
          width: 460,
          height: 499,
        },
        label: "Face",
        role: "Model identity kept consistent across shots",
        // Just off the face rather than over it.
        pin: { left: 61, top: 14 },
      },
      {
        image: {
          src: "/images/gallery/look-outfit.jpg",
          alt: "Close-up product photo of a grey kurta with an embroidered placket",
          width: 823,
          height: 1057,
        },
        label: "Kurta",
        role: "Product photo — fabric, placket embroidery, collar",
        pin: { left: 54, top: 37 },
      },
      {
        image: {
          src: "/images/gallery/look-pose.jpg",
          alt: "Reference photo of a model standing in the target pose",
          width: 900,
          height: 1200,
        },
        label: "Pose reference",
        role: "Stance, hand placement, camera angle",
        // Anchored on the hand-in-pocket, the most pose-specific detail.
        pin: { left: 67, top: 50 },
      },
      {
        image: {
          src: "/images/gallery/look-shoes.jpg",
          alt: "Product photo of black leather slip-on shoes",
          width: 900,
          height: 1200,
        },
        label: "Shoes",
        role: "Product photo — shape and finish",
        pin: { left: 51, top: 93 },
      },
    ],
  },
];

export interface GalleryTileData {
  image: GalleryImage;
  caption: string;
}

export const GALLERY_TILES: GalleryTileData[] = [
  {
    image: {
      src: "/images/gallery/outfit-generated.jpg",
      alt: "AI-generated photorealistic model wearing a printed shirt and grey trousers in the reference pose",
      width: 1400,
      height: 2508,
    },
    caption: "Western streetwear — shirt and trousers merged onto one model in a single pass",
  },
  {
    image: {
      src: "/images/gallery/lehenga-output-alt.jpg",
      alt: "AI-generated photorealistic model wearing the embroidered lehenga, a second angle from the same generation",
      width: 893,
      height: 1600,
    },
    caption: "A second angle from the same shoot — no reshoot, same generation",
  },
];
