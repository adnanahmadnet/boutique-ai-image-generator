export interface NavLink {
  label: string;
  href: string;
}

// Testimonials is deliberately not linked here yet. data/testimonials.ts is
// empty by design (no fabricated quotes), so putting it in the primary nav
// sends visitors to a page that reads "no published testimonials yet" —
// which is worse than not offering the link. Add it back the moment there
// are real entries; the page itself already exists at /testimonials.
export const MAIN_NAV: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "Gallery", href: "/gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export const FOOTER_NAV: NavLink[] = [
  { label: "Features", href: "/features" },
  { label: "Gallery", href: "/gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms & Refunds", href: "/terms" },
];
