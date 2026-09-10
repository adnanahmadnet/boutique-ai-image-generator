import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import PasswordAuthForm from "@/components/auth/PasswordAuthForm";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Login — AI Image Generation Pipeline",
  description: "Access your buyer dashboard, order history, and downloads.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Buyer dashboard"
          heading="Log in"
          subheading="Enter your email and password to access your dashboard."
        />
        <div className="w-full max-w-sm">
          <PasswordAuthForm
            mode="login"
            redirectTo={redirectTo || "/"}
            isConfigured={isDatabaseConfigured()}
          />
          <p className="mt-4 text-center text-[13px] text-text-muted">
            New here?{" "}
            <Link href="/signup" className="text-accent hover:opacity-80">
              Create an account
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
