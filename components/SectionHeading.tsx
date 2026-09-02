export default function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "center",
}: {
  eyebrow: string;
  heading: string;
  subheading?: string;
  align?: "center" | "left";
}) {
  const alignClass = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
        {eyebrow}
      </span>
      <h2 className="text-balance font-heading text-3xl font-bold leading-tight text-text sm:text-4xl">
        {heading}
      </h2>
      {subheading ? (
        <p className="text-balance text-[15px] leading-relaxed text-text-muted">
          {subheading}
        </p>
      ) : null}
    </div>
  );
}
