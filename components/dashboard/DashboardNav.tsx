import Link from "next/link";
import { SITE } from "@/data/site";
import LogoutButton from "@/components/dashboard/LogoutButton";

const LINKS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Orders", href: "/dashboard/orders" },
  { label: "Downloads", href: "/dashboard/downloads" },
];

export default function DashboardNav({ email }: { email: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-heading text-[15px] font-bold text-text">
            {SITE.brand}
          </Link>
          <nav className="flex items-center gap-5">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13.5px] text-text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12.5px] text-text-dim sm:inline">{email}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
