import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import GalleryTile from "@/components/GalleryTile";
import { SITE } from "@/data/site";
import { GALLERY_TILES } from "@/data/gallery";

export default function GalleryGrid({
  limit,
  viewAllHref,
}: {
  limit?: number;
  viewAllHref?: string;
}) {
  const tiles = typeof limit === "number" ? GALLERY_TILES.slice(0, limit) : GALLERY_TILES;

  return (
    <section id="gallery" className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={SITE.gallery.eyebrow}
            heading={SITE.gallery.heading}
            subheading={SITE.gallery.subheading}
            align={viewAllHref ? "left" : "center"}
          />
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="shrink-0 whitespace-nowrap text-[13.5px] font-medium text-accent hover:opacity-80"
            >
              View full gallery →
            </Link>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {tiles.map((tile) => (
            <GalleryTile key={tile.image.src} {...tile} />
          ))}
        </div>
      </Container>
    </section>
  );
}
