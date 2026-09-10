import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Models from "@/components/Models";
import Features from "@/components/Features";
import WorkflowSteps from "@/components/WorkflowSteps";
import { COMBINE_DEMO } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Features — AI Image Generation Pipeline",
  description:
    "4 AI models behind one interface, real before/after examples, typical turnaround time, and zero design skills required.",
};

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-20">
        <Container className="flex flex-col items-center gap-14">
          <SectionHeading
            eyebrow="Features"
            heading="No photoshoot, no design skills, no waiting"
            subheading="Upload a flat product photo, pick a model, and get a photorealistic on-model shot back — the pipeline handles routing, retries, and delivery."
          />
          <BeforeAfterSlider before={COMBINE_DEMO.pose} after={COMBINE_DEMO.result} />
        </Container>
      </section>

      <WorkflowSteps />
      <Models />
      <Features />
    </>
  );
}
