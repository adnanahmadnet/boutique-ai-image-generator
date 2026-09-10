import Image from "next/image";
import { IconTool } from "@tabler/icons-react";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { SETUP_REQUIREMENTS, SETUP_COMPLEXITY } from "@/data/setup";

// Stated before the pricing section on purpose. Buyers of self-hosted kits
// discover these requirements eventually; the only question is whether they
// discover them before paying or after. Before is cheaper for everyone.
export default function SetupRequirements() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={SITE.setup.eyebrow}
          heading={SITE.setup.heading}
          subheading={SITE.setup.subheading}
        />

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-default bg-accent-dim text-accent">
                <IconTool size={17} />
              </span>
              <div>
                <span className="block font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
                  Setup complexity
                </span>
                <span className="block font-heading text-[14px] font-semibold text-text">
                  {SETUP_COMPLEXITY.level}
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-text-muted">
              {SETUP_COMPLEXITY.detail}
            </p>

            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              {SETUP_REQUIREMENTS.map((req) => (
                <div
                  key={req.name}
                  className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <span className="block text-[13.5px] font-medium text-text">{req.name}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-text-muted">
                      {req.purpose}
                    </span>
                  </div>
                  <span className="shrink-0 text-right font-mono text-[11px] uppercase tracking-wide text-text-dim">
                    {req.note}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <figure className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-lg border border-border bg-surface p-3">
              <Image
                src="/images/n8n-workflow-diagram.png"
                alt="The complete n8n workflow canvas: webhook intake and model router on the left, the four colour-coded model branches in the middle, and the shared export and delivery lanes on the right"
                width={1304}
                height={587}
                sizes="(max-width: 1024px) 92vw, 560px"
                className="w-full rounded-default"
              />
            </div>
            <figcaption className="text-[12.5px] leading-snug text-text-dim">
              The whole pipeline, exactly as it arrives in your n8n. Nothing is hidden or minified —
              you can open any node and change it.
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
