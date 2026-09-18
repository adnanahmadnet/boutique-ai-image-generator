import Hero from "@/components/Hero";
import StatBar from "@/components/StatBar";
import StyleShowcase from "@/components/StyleShowcase";
import WorkflowSteps from "@/components/WorkflowSteps";
import CombineDemo from "@/components/CombineDemo";
import Console from "@/components/Console";
import RunningCosts from "@/components/RunningCosts";
import SetupRequirements from "@/components/SetupRequirements";
import Models from "@/components/Models";
import PricingTeaser from "@/components/PricingTeaser";
import Testimonials from "@/components/Testimonials";
import { TESTIMONIALS } from "@/data/testimonials";
import { getCurrentViewer } from "@/lib/get-current-viewer";

export default async function Home() {
  const { isLoggedIn } = await getCurrentViewer();

  return (
    <>
      {/* Order runs: outcome -> visual proof -> the tool you'll actually use
          -> how it works -> what it costs -> what you need -> buy. The
          technical sections stay (they're proof the thing is real) but sit
          after the buyer-facing ones rather than leading. */}
      <Hero isLoggedIn={isLoggedIn} />
      <StatBar />
      <StyleShowcase />
      <CombineDemo />
      <Console />
      <WorkflowSteps />
      <Models />
      <RunningCosts />
      <SetupRequirements />
      <PricingTeaser isLoggedIn={isLoggedIn} />
      {TESTIMONIALS.length > 0 ? <Testimonials /> : null}
    </>
  );
}
