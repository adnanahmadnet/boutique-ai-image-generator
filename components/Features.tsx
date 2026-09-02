import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import FeatureCard from "@/components/FeatureCard";
import { SITE } from "@/data/site";
import { FEATURES } from "@/data/features";

export default function Features() {
  return (
    <section id="reliability" className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={SITE.features.eyebrow}
          heading={SITE.features.heading}
          subheading={SITE.features.subheading}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
