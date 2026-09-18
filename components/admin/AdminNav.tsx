"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/data/site";
import LogoutButton from "@/components/dashboard/LogoutButton";

const LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Support Team", href: "/admin/support-team" },
  { label: "Contact", href: "/admin/contact" },
];

export default function AdminNav({ newMessageCount = 0 }: { newMessageCount?: number }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading text-[15px] font-bold text-text">
            {SITE.brand}
            <span className="ml-2 rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 font-mono text-[10px] font-normal text-accent">
              ADMIN
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            {LINKS.map((link) => {
              const isActive = pathname === link.href;
              const showBadge = link.href === "/admin/contact" && newMessageCount > 0;
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
                    <span className="inline-flex animate-pulse items-center rounded-full bg-danger px-2 py-0.5 font-mono text-[10px] font-bold uppercase leading-none tracking-wide text-white">
                      {newMessageCount > 1 ? `${newMessageCount} new` : "New query"}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
