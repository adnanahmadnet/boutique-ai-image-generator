import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — AI Image Generation Pipeline",
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
        <div className="w-full max-w-lg">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
