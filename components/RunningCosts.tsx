import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { RUNNING_COSTS, COST_EXAMPLE } from "@/data/costs";

// Bring-your-own-key products live or die on whether the buyer can work out
// their running cost before paying. Stating it plainly — with a worked total
// rather than a vague "pennies per image" — removes the biggest unknown.
export default function RunningCosts() {
  return (
    <section className="border-y border-border bg-surface/40 py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={SITE.costs.eyebrow}
          heading={SITE.costs.heading}
          subheading={SITE.costs.subheading}
        />

        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-surface">
          {RUNNING_COSTS.map((line) => (
            <div
              key={line.service}
              className="flex flex-col gap-1 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
            >
              <div className="min-w-0">
                <span className="block font-heading text-[14px] font-semibold text-text">
                  {line.service}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-text-muted">
                  {line.purpose}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[13.5px] text-accent">{line.cost}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 rounded-lg border border-accent/25 bg-accent-dim px-6 py-7 text-center">
          <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
            {COST_EXAMPLE.label}
          </span>
          <span className="font-heading text-3xl font-bold text-text">{COST_EXAMPLE.total}</span>
          <span className="text-[13px] text-text-muted">{COST_EXAMPLE.detail}</span>
          <span className="mt-1 text-[12.5px] text-text-dim">{COST_EXAMPLE.note}</span>
        </div>
      </Container>
    </section>
  );
}
