import { IconCheck } from "@tabler/icons-react";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import PayPalCheckout from "@/components/PayPalCheckout";
import { SITE } from "@/data/site";
import { PRICING } from "@/data/pricing";

export default function Pricing() {
  return (
    <section id="pricing" className="border-y border-border bg-surface/40 py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          eyebrow={SITE.pricing.eyebrow}
          heading={SITE.pricing.heading}
          subheading={SITE.pricing.subheading}
        />

        <div className="grid w-full max-w-3xl grid-cols-1 gap-0 overflow-hidden rounded-lg border border-border-hover bg-surface sm:grid-cols-2">
          <div className="flex flex-col gap-5 p-8">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
                {PRICING.label}
              </span>
              <h3 className="mt-1 font-heading text-lg font-semibold text-text">
                {PRICING.planName}
              </h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {PRICING.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13.5px] text-text-muted">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-5 border-t border-border bg-surface-2 p-8 sm:border-t-0 sm:border-l">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl text-text">
                ${PRICING.amount.split(".")[0]}
              </span>
              <span className="font-mono text-base text-text-dim">
                .{PRICING.amount.split(".")[1]} {PRICING.currency}
              </span>
            </div>
            <PayPalCheckout />
          </div>
        </div>
      </Container>
    </section>
  );
}
