import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import PasswordAuthForm from "@/components/auth/PasswordAuthForm";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = {
  title: "Sign Up — AI Image Generation Pipeline",
  description: "Create your account to view the resources and get access to the toolkit.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-10">
        <SectionHeading
          eyebrow="Get started"
          heading="Create your account"
          subheading="Set an email and password. You can browse what's included before you pay."
        />
        <div className="w-full max-w-sm">
          <PasswordAuthForm
            mode="signup"
            redirectTo={redirectTo || "/"}
            isConfigured={isDatabaseConfigured()}
          />
          <p className="mt-4 text-center text-[13px] text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:opacity-80">
              Log in
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
