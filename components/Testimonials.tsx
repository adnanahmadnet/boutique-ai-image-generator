import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import TestimonialCard from "@/components/TestimonialCard";
import { TESTIMONIALS } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Testimonials"
          heading="What boutique owners are saying"
          subheading={
            TESTIMONIALS.length === 0
              ? "We're just getting started — real customer stories will appear here as boutiques go live with the pipeline."
              : undefined
          }
        />

        {TESTIMONIALS.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-[14px] text-text-muted">
              No published testimonials yet — be among our first customers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.boutiqueName} testimonial={testimonial} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
