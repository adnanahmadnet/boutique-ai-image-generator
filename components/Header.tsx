"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Container from "@/components/Container";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { SITE } from "@/data/site";
import { MAIN_NAV } from "@/data/nav";

// Ignore tiny scroll deltas (trackpad jitter, mobile momentum) so the header
// doesn't flicker, and never hide it near the very top of the page.
const SCROLL_DELTA_THRESHOLD = 4;
const HIDE_AFTER_Y = 80;

export default function Header({
  displayName,
  isLoggedIn,
  dashboardHref = "/dashboard/downloads",
  dashboardLabel = "Dashboard",
}: {
  displayName: string | null;
  isLoggedIn: boolean;
  dashboardHref?: string;
  dashboardLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY < HIDE_AFTER_Y) {
        setHidden(false);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        setHidden(true);
        setOpen(false);
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-heading text-[15px] font-bold text-text">
          {SITE.brand}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {MAIN_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13.5px] text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="text-[13.5px] text-text-muted transition-colors hover:text-text"
            >
              {dashboardLabel}
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              {displayName ? (
                <span
                  className="hidden max-w-[120px] truncate text-[13.5px] text-text-muted lg:inline"
                  title={displayName}
                >
                  {displayName}
                </span>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13.5px] text-text-muted transition-colors hover:text-text"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-default bg-accent px-4 py-2 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Get Access
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-default border border-border text-text-muted md:hidden"
        >
          {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {MAIN_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-default px-2 py-2.5 text-[14px] text-text-muted hover:bg-surface hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className="rounded-default px-2 py-2.5 text-[14px] text-text-muted hover:bg-surface hover:text-text"
              >
                {dashboardLabel}
              </Link>
            ) : null}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {isLoggedIn ? (
                <>
                  {displayName ? (
                    <span className="truncate px-2 py-1 text-[13px] text-text-dim">
                      {displayName}
                    </span>
                  ) : null}
                  <div onClick={() => setOpen(false)}>
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-default px-2 py-2.5 text-[14px] text-text-muted hover:bg-surface hover:text-text"
                  >
                    Login
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-default bg-accent px-4 py-3 font-heading text-sm font-bold text-accent-foreground"
                  >
                    Get Access
                  </Link>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
