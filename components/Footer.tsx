import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/data/site";
import { FOOTER_NAV } from "@/data/nav";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <Container className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="font-heading text-sm font-semibold text-text">{SITE.name}</p>
          <p className="text-[12.5px] text-text-dim">
            Built by {SITE.builtBy} &middot; {SITE.footer.note}
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {FOOTER_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[12.5px] text-text-muted transition-colors hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
