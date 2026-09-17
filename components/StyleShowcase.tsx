import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import FanCarousel from "@/components/FanCarousel";
import { STYLE_CARDS } from "@/data/styles";

export default function StyleShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Styles"
          heading="One product photo, every look"
          subheading="Pick a style and the pipeline puts your product on a real model, shot to match — no reshoot required."
        />
        <FanCarousel cards={STYLE_CARDS} />
      </Container>
    </section>
  );
}
