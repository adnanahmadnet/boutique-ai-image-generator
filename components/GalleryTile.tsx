import Image from "next/image";
import type { GalleryTileData } from "@/data/gallery";

export default function GalleryTile({ image, caption }: GalleryTileData) {
  return (
    <figure className="group overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <figcaption className="border-t border-border px-4 py-3 text-[13px] text-text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
