import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import Container from "@/components/Container";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { SITE } from "@/data/site";
import { HERO_PAIR } from "@/data/gallery";

export default function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { hero } = SITE;
  const ctaHref = isLoggedIn ? hero.ctaHref : "/login";

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(245,200,66,0.10),transparent)]"
        aria-hidden
      />
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] tracking-wide text-text-muted">
            {hero.eyebrow}
          </span>
          <h1 className="text-balance font-heading text-4xl font-bold leading-[1.08] text-text sm:text-5xl lg:text-[3.25rem]">
            {hero.headline}
          </h1>
          <p className="max-w-xl text-balance text-[16px] leading-relaxed text-text-muted sm:text-lg">
            {hero.subheadline}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-default bg-accent px-6 py-3.5 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
            >
              {hero.ctaLabel}
              <IconArrowRight size={16} />
            </Link>
            <Link
              href={hero.secondaryHref}
              className="inline-flex items-center gap-2 rounded-default border border-border px-6 py-3.5 text-sm font-medium text-text-muted transition-colors hover:border-border-hover hover:text-text"
            >
              {hero.secondaryLabel}
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <BeforeAfterSlider before={HERO_PAIR.before} after={HERO_PAIR.after} />
        </div>
      </Container>
    </section>
  );
}
