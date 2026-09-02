import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { PRICING } from "@/data/pricing";
import { LEGAL } from "@/data/legal";

export const metadata: Metadata = {
  title: "Terms & Refund Policy — AI Image Generation Pipeline",
  description: "License terms, usage, and refund policy.",
};

export default function TermsPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeading eyebrow="Legal" heading="Terms & Refund Policy" align="left" />
        <p className="text-[12.5px] text-text-dim">Last updated: {LEGAL.lastUpdated}</p>

        <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-text-muted">
          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              What you&apos;re buying
            </h2>
            <p>
              A one-time purchase of {PRICING.planName}: the operator console, the n8n
              workflow files, the Notion database template, and the setup write-up. You run
              it on your own n8n, fal.ai, Google Drive, and Notion accounts — {SITE.builtBy}{" "}
              doesn&apos;t host or operate the tool for you.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              License
            </h2>
            <p>
              Your purchase includes a license key shown in your dashboard and sent by email.
              It functions as an entitlement and support reference — the delivered files
              don&apos;t technically enforce it. You may use the toolkit for your own
              boutique/business. Reselling, redistributing, or publicly sharing the workflow
              files or launcher themselves is not permitted.
            </p>
          </section>

          <section id="refund-policy">
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              Refund policy
            </h2>
            <p>
              If the toolkit doesn&apos;t work as described, contact {LEGAL.supportEmail}{" "}
              within {LEGAL.refundWindowDays} days of purchase and we&apos;ll work with you to
              resolve it or issue a refund.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              No warranty
            </h2>
            <p>
              The toolkit is provided &ldquo;as is.&rdquo; You&apos;re responsible for costs
              incurred on your own n8n, fal.ai, Google Drive, and Notion accounts once you run
              it — {SITE.builtBy} isn&apos;t liable for those third-party charges or for
              downtime of third-party services the toolkit depends on.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">Contact</h2>
            <p>
              Questions about these terms? Reach us at {LEGAL.supportEmail} or via the Contact
              page.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
