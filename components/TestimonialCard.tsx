import { IconStarFilled } from "@tabler/icons-react";
import type { Testimonial } from "@/data/testimonials";

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStarFilled
            key={i}
            size={14}
            className={i < testimonial.rating ? "text-accent" : "text-border"}
          />
        ))}
      </div>
      <blockquote className="text-[14px] leading-relaxed text-text-muted">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="font-heading text-[13px] font-semibold text-text">
        {testimonial.boutiqueName}
      </figcaption>
    </figure>
  );
}
