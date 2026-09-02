import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { WORKFLOW_STEPS } from "@/data/workflow";

export default function WorkflowSteps() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow={SITE.howItWorks.eyebrow}
          heading={SITE.howItWorks.heading}
          subheading={SITE.howItWorks.subheading}
        />

        <ol className="relative flex flex-col gap-10 sm:flex-row sm:gap-6">
          <div
            className="absolute top-6 left-6 hidden h-px w-[calc(100%-3rem)] bg-border sm:block"
            aria-hidden
          />
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.index} className="relative flex flex-1 gap-4 sm:flex-col sm:gap-4">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-hover bg-surface text-accent">
                  <Icon size={20} stroke={1.75} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[11px] text-text-dim">
                    Step {step.index}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-text">
                    {step.title}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
