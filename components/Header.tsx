"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Container from "@/components/Container";
import { SITE } from "@/data/site";
import { MAIN_NAV } from "@/data/nav";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
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
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-[13.5px] text-text-muted transition-colors hover:text-text"
          >
            Login
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-default bg-accent px-4 py-2 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Get Access
          </Link>
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
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-default px-2 py-2.5 text-[14px] text-text-muted hover:bg-surface hover:text-text"
              >
                Login
              </Link>
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-default bg-accent px-4 py-3 font-heading text-sm font-bold text-accent-foreground"
              >
                Get Access
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
