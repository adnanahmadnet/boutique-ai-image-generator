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

export interface GalleryTileData {
  image: GalleryImage;
  caption: string;
}

export const GALLERY_TILES: GalleryTileData[] = [
  {
    image: {
      src: "/images/gallery/consistency-grid.jpg",
      alt: "Four AI-generated angles of the same consistent model identity in a blazer",
      width: 893,
      height: 1600,
    },
    caption: "One identity, four angles, zero re-shoots",
  },
  {
    image: {
      src: "/images/gallery/heels-input.jpg",
      alt: "Plain e-commerce product photo of gold metallic heels",
      width: 1170,
      height: 1153,
    },
    caption: "Accepts plain product shots as input — no special photography needed",
  },
];
