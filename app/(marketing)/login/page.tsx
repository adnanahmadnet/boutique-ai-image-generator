import type { Metadata } from "next";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import MagicLinkForm from "@/components/auth/MagicLinkForm";

export const metadata: Metadata = {
  title: "Login — AI Image Generation Pipeline",
  description: "Access your buyer dashboard, order history, and downloads.",
};

export default function LoginPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Buyer dashboard"
          heading="Log in"
          subheading="Enter the email you purchased with — we'll send a one-click login link, no password needed."
        />
        <div className="w-full max-w-sm">
          <MagicLinkForm />
        </div>
      </Container>
    </section>
  );
}
