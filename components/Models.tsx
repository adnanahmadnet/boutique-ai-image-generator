import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ModelCard from "@/components/ModelCard";
import { SITE } from "@/data/site";
import { MODELS } from "@/data/models";

export default function Models() {
  return (
    <section id="models" className="border-y border-border bg-surface/40 py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={SITE.models.eyebrow}
          heading={SITE.models.heading}
          subheading={SITE.models.subheading}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MODELS.map((model) => (
            <ModelCard key={model.slug} model={model} />
          ))}
        </div>
      </Container>
    </section>
  );
}
