import Hero from "@/components/Hero";
import StatBar from "@/components/StatBar";
import GalleryGrid from "@/components/GalleryGrid";
import WorkflowSteps from "@/components/WorkflowSteps";
import Models from "@/components/Models";
import PricingTeaser from "@/components/PricingTeaser";
import Testimonials from "@/components/Testimonials";
import { TESTIMONIALS } from "@/data/testimonials";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function Home() {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);

  return (
    <>
      <Hero isLoggedIn={isLoggedIn} />
      <StatBar />
      <GalleryGrid limit={2} viewAllHref="/gallery" />
      <WorkflowSteps />
      <Models />
      <PricingTeaser isLoggedIn={isLoggedIn} />
      {TESTIMONIALS.length > 0 ? <Testimonials /> : null}
    </>
  );
}
