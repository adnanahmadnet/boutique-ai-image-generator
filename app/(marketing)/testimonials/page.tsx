import type { Metadata } from "next";
import Testimonials from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Testimonials — AI Image Generation Pipeline",
  description: "What boutique owners say after switching to AI-generated product photography.",
};

export default function TestimonialsPage() {
  return (
    <div className="pt-8">
      <Testimonials />
    </div>
  );
}
