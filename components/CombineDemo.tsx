import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { SITE } from "@/data/site";
import { HERO_PAIR } from "@/data/gallery";

export default function CombineDemo() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-14">
        <SectionHeading
          eyebrow={SITE.combineDemo.eyebrow}
          heading={SITE.combineDemo.heading}
          subheading={SITE.combineDemo.subheading}
        />
        <BeforeAfterSlider before={HERO_PAIR.before} after={HERO_PAIR.after} />
      </Container>
    </section>
  );
}
