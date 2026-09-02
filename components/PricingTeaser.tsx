import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { PRICING } from "@/data/pricing";

export default function PricingTeaser() {
  return (
    <section className="border-y border-border bg-surface/40 py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow={SITE.pricing.eyebrow}
          heading={SITE.pricing.heading}
          subheading={SITE.pricing.subheading}
        />

        <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-lg border border-border-hover bg-surface p-8 text-center">
          <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
            {PRICING.label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-4xl text-text">
              ${PRICING.amount.split(".")[0]}
            </span>
            <span className="font-mono text-base text-text-dim">
              .{PRICING.amount.split(".")[1]} {PRICING.currency}
            </span>
          </div>
          <ul className="flex flex-col items-start gap-2 self-stretch">
            {PRICING.includes.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] text-text-muted">
                <IconCheck size={15} className="mt-0.5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-default bg-accent px-6 py-3.5 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Get Access
            <IconArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
