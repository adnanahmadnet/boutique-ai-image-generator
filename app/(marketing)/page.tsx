import Hero from "@/components/Hero";
import StatBar from "@/components/StatBar";
import GalleryGrid from "@/components/GalleryGrid";
import WorkflowSteps from "@/components/WorkflowSteps";
import Models from "@/components/Models";
import PricingTeaser from "@/components/PricingTeaser";
import Testimonials from "@/components/Testimonials";
import { TESTIMONIALS } from "@/data/testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <StatBar />
      <GalleryGrid limit={2} viewAllHref="/gallery" />
      <WorkflowSteps />
      <Models />
      <PricingTeaser />
      {TESTIMONIALS.length > 0 ? <Testimonials /> : null}
    </>
  );
}
