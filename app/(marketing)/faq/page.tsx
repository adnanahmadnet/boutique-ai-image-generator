import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import FAQAccordion from "@/components/FAQAccordion";
import { FAQ_ITEMS } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ — PixelCore Engine",
  description: "Setup requirements, licensing, and refund questions answered.",
};

export default function FaqPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="FAQ"
          heading="Frequently asked questions"
          subheading="Can't find what you're looking for? Reach out on the Contact page."
        />
        <div className="w-full max-w-2xl">
          <FAQAccordion items={FAQ_ITEMS} />
        </div>
      </Container>
    </section>
  );
}
