import type { Metadata } from "next";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — PixelCore Engine",
  description: "One-time purchase, own the full pipeline. Pay securely via PayPal.",
};

export default function PricingPage() {
  return (
    <div className="pt-8">
      <Pricing />
    </div>
  );
}
