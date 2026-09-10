import Image from "next/image";
import type { GalleryTileData } from "@/data/gallery";

export default function GalleryTile({ image, caption }: GalleryTileData) {
  return (
    <figure className="group overflow-hidden rounded-lg border border-border bg-surface">
      <div
        className="relative w-full overflow-hidden"
        // Matches the container's aspect ratio to the source image's actual
        // dimensions so object-cover never has to crop the top or bottom —
        // a fixed ratio (e.g. 4:5) doesn't fit these mostly-portrait shots.
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <figcaption className="border-t border-border px-4 py-3 text-[13px] text-text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
