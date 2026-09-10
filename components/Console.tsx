import Image from "next/image";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { SITE } from "@/data/site";

// The operator console is what a buyer actually touches every day, so it gets
// shown rather than described — and shown mid-job, with real references
// loaded, rather than as an empty form. Doubles as the "you don't have to be
// technical" reassurance: the n8n canvas is real and inspectable, but it is
// not where the work happens.
const STEPS = [
  {
    image: "/images/launcher-1-references.jpg",
    width: 928,
    height: 897,
    alt: "The console with a profile selected and four reference images uploaded — the target pose, the model's face, the trousers and the shirt",
    label: "Pick a profile, drop in the pieces",
    body: "Six profiles are ready to go — men, women, jewellery, shoes, upscale, multiple poses. Each one gives you labelled slots: the pose you want, the face to keep, the garment, the shoes. Drag them in and the console uploads them for you.",
  },
  {
    image: "/images/launcher-2-prompt.jpg",
    width: 920,
    height: 886,
    alt: "The prompt builder showing dropdowns for model descriptor, top wear, bottom wear and footwear, above a long live prompt assigning each reference image a specific job",
    label: "Write the prompt",
    body: "This is where you describe the shot you want. Dropdowns cover the recurring choices — the model, the top wear, the bottom wear, the footwear — and the prompt itself is a full editor, so you can be as specific as the shot needs: which reference controls the pose, which one controls the face, which one controls the garment.",
  },
  {
    image: "/images/launcher-3-generate.jpg",
    width: 926,
    height: 880,
    alt: "Generation settings for aspect ratio, resolution, output format and image count, above the exact JSON payload that will be sent, and a Generate Image button",
    label: "Hit generate",
    body: "Set the aspect ratio and resolution — the price per image is shown right on the option. You can see the exact payload before it goes. Then it’s one button, and the finished shot lands in your Drive with a row in your Notion log.",
  },
];

export default function Console() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="flex flex-col gap-16">
        <SectionHeading
          eyebrow={SITE.console.eyebrow}
          heading={SITE.console.heading}
          subheading={SITE.console.subheading}
        />

        <div className="flex flex-col gap-16 sm:gap-20">
          {STEPS.map((step, index) => (
            <div
              key={step.image}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div
                className={`flex flex-col gap-3 ${
                  // Alternate sides so the scroll doesn't read as one long column.
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
                  Step {index + 1}
                </span>
                <h3 className="font-heading text-xl font-bold text-text">{step.label}</h3>
                <p className="text-[14px] leading-relaxed text-text-muted">{step.body}</p>
              </div>

              <div
                className={`overflow-hidden rounded-lg border border-border bg-surface ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={step.width}
                  height={step.height}
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
