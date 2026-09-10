import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import CombineBreakdown from "@/components/CombineBreakdown";
import GalleryGrid from "@/components/GalleryGrid";
import { PROVENANCE_EXAMPLES } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Screenshots & Demo Gallery — AI Image Generation Pipeline",
  description:
    "Real before/after examples produced by the pipeline — flat product photography transformed into photorealistic on-model shots.",
};

export default function GalleryPage() {
  return (
    <div className="pt-8">
      <section className="pt-20 sm:pt-28">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Provenance"
            heading="The exact files behind this shot"
            subheading="Two finished shots, and every source file that went into each. Nothing else — no studio, no model booking, no retouching pass."
          />
          <div className="grid w-full gap-6 xl:grid-cols-2">
            {PROVENANCE_EXAMPLES.map((example) => (
              <CombineBreakdown key={example.result.src} example={example} />
            ))}
          </div>
        </Container>
      </section>

      <GalleryGrid />
    </div>
  );
}
