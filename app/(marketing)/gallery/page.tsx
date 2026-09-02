import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Screenshots & Demo Gallery — AI Image Generation Pipeline",
  description:
    "Real before/after examples produced by the pipeline — flat product photography transformed into photorealistic on-model shots.",
};

export default function GalleryPage() {
  return (
    <div className="pt-8">
      <GalleryGrid />
    </div>
  );
}
