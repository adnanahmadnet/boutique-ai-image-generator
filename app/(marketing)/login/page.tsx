import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import PasswordAuthForm from "@/components/auth/PasswordAuthForm";
import { isDatabaseConfigured } from "@/lib/db";
import { getCurrentViewer } from "@/lib/get-current-viewer";

export const metadata: Metadata = {
  title: "Login — PixelCore Engine",
  description: "Access your buyer dashboard, order history, and downloads.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  // Already signed in (as any of the three identities) — send them straight
  // to their own dashboard rather than showing the form again. Ignoring
  // `redirectTo` here on purpose: honoring it could bounce someone back to
  // a protected route their *current* identity can't access (e.g. a buyer
  // hitting /login?redirectTo=/admin), which would just redirect them back
  // here in a loop.
  const viewer = await getCurrentViewer();
  if (viewer.isLoggedIn) {
    redirect(viewer.dashboardHref);
  }

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
            redirectTo={redirectTo || "/dashboard"}
            isConfigured={isDatabaseConfigured()}
          />
          <p className="mt-4 text-center text-[13px] text-text-muted">
            New here?{" "}
            <Link
              href={redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : "/signup"}
              className="text-accent hover:opacity-80"
            >
              Create an account
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
