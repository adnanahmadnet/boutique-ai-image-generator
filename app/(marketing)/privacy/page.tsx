import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";
import { LEGAL } from "@/data/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — AI Image Generation Pipeline",
  description: "What we collect, why, and how it's protected.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeading eyebrow="Privacy" heading="Privacy Policy" align="left" />
        <p className="text-[12.5px] text-text-dim">Last updated: {LEGAL.lastUpdated}</p>

        <div className="flex flex-col gap-6 text-[14px] leading-relaxed text-text-muted">
          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              What we collect
            </h2>
            <p>
              When you make a purchase, we collect your email address and, optionally, your
              boutique name — used to create your order, license, and (if you choose to log in)
              your buyer account. We do not collect or store your card or bank details; PayPal
              handles payment directly and only shares confirmation that a payment was
              completed. If you use the Contact form, we store your name, email, and message so
              we can respond.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              Why we collect it
            </h2>
            <p>
              To process your order, generate and display your license key, deliver your
              download link, send order-confirmation email, and respond to support requests.
              We don&apos;t sell or rent your information, and we don&apos;t use it for
              advertising.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              Who we share it with
            </h2>
            <p>
              PayPal (to process payment) and our transactional email provider (to send your
              order confirmation). Orders, licenses, and login are stored in our own database.
              Each only receives what&apos;s necessary to perform its function.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">Cookies</h2>
            <p>
              If you log in to the buyer dashboard, we set a session cookie to keep you signed
              in. We don&apos;t use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">
              Your rights
            </h2>
            <p>
              You can ask us to access, correct, or delete the personal data we hold about you
              at any time by contacting {LEGAL.supportEmail}.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-heading text-[15px] font-semibold text-text">Contact</h2>
            <p>
              Questions about this policy? Reach {SITE.builtBy} at {LEGAL.supportEmail} or via
              the Contact page.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
