"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";
import { SITE } from "@/data/site";
import LogoutButton from "@/components/dashboard/LogoutButton";

const LINKS = [
  { label: "Resources", href: "/dashboard/downloads" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Contact", href: "/dashboard/contact" },
];

export default function DashboardNav({
  displayName,
  unseenReplyCount = 0,
}: {
  displayName: string;
  unseenReplyCount?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <Container className="flex flex-col gap-4 py-4 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link href="/" className="font-heading text-[15px] font-bold text-text">
          {SITE.brand}
        </Link>

        <nav className="flex flex-wrap items-center gap-7">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            const showBadge = link.href === "/dashboard/contact" && unseenReplyCount > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 text-[13.5px] transition-colors ${
                  isActive ? "font-semibold text-accent" : "text-text-muted hover:text-text"
                }`}
              >
                {link.label}
                {showBadge ? (
                  <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase leading-none tracking-wide text-accent-foreground">
                    {unseenReplyCount > 1 ? `${unseenReplyCount} new` : "New"}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-[12.5px] text-text-dim sm:inline">{displayName}</span>
          <LogoutButton />
        </div>
      </Container>
    </header>
  );
}
