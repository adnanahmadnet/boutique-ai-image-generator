import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — PixelCore Engine",
  description: "Pre-sale questions or post-sale support — reach out here.",
};

export default function ContactPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow="Contact"
          heading="Questions before or after buying"
          subheading="Send a message and we'll reply by email."
        />
        <p className="max-w-lg text-center text-[13.5px] leading-relaxed text-text-muted">
          Need a hand with any of it — setup, customizing the pipeline, deployment, even running a
          photoshoot for you? We offer paid support based on whatever you actually need. Tell us
          what you&apos;re after below and we&apos;ll scope it out.
        </p>
        <div className="w-full max-w-lg">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
