import { Fragment } from "react";
import Image from "next/image";
import { IconPlus, IconArrowRight, IconArrowDown } from "@tabler/icons-react";
import type { ProvenanceExample } from "@/data/gallery";

// Shows the provenance of one generated image: the exact files that went in,
// and — via matching numbered pins on the result — which part of the output
// each one is responsible for. Static by design: the animated version of
// this story already lives in the hero (CombineDemoVisual); here it should
// read as documentation you can study, not a loop.
//
// Sizing is driven by container queries rather than viewport breakpoints,
// because this card is rendered both side-by-side with a sibling (roughly
// half width) and on its own (full width) — it has to adapt to the space it
// is actually given, not to the size of the window.
export default function CombineBreakdown({ example }: { example: ProvenanceExample }) {
  const { title, result, sources } = example;

  return (
    <div className="@container flex h-full w-full flex-col rounded-lg border border-border bg-surface p-5 @3xl:p-8">
      <p className="mb-6 border-b border-border pb-4 font-heading text-[14px] font-semibold text-text">
        {title}
      </p>

      <div className="flex flex-1 flex-col items-center gap-6 @md:flex-row @md:items-center @md:gap-4 @3xl:gap-8">
        {/* Inputs, stacked as a receipt-style list */}
        <div className="w-full @md:flex-1">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-text-dim">
            {sources.length} inputs
          </p>
          <ol className="flex flex-col gap-2">
            {sources.map((source, index) => (
              <Fragment key={source.image.src}>
                {index > 0 ? (
                  <IconPlus
                    size={15}
                    className="ml-[26px] shrink-0 text-text-dim @3xl:ml-[34px]"
                    aria-hidden
                  />
                ) : null}
                <li className="flex items-center gap-3 @3xl:gap-4">
                  <div className="relative aspect-[3/4] w-[64px] shrink-0 overflow-hidden rounded-default border border-border bg-surface-2 @3xl:w-[84px]">
                    <Image
                      src={source.image.src}
                      alt={source.image.alt}
                      fill
                      sizes="84px"
                      className="object-cover"
                    />
                    <span className="absolute left-1 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-accent-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-medium text-text @3xl:text-[13.5px]">
                      {source.label}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-text-dim @3xl:text-[12px]">
                      {source.role}
                    </span>
                  </div>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>

        {/* Equals */}
        <div className="flex shrink-0 items-center justify-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-text-muted @3xl:h-9 @3xl:w-9">
            <IconArrowDown size={16} className="@md:hidden" aria-hidden />
            <IconArrowRight size={16} className="hidden @md:block" aria-hidden />
          </span>
          <span className="sr-only">produces</span>
        </div>

        {/* Result, with a pin per input */}
        <div className="w-full max-w-[200px] shrink-0 @md:max-w-[172px] @3xl:max-w-[270px]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-wide text-accent">
            1 generated result
          </p>
          <figure>
            <div
              className="relative w-full overflow-hidden rounded-default border border-border bg-surface-2"
              style={{ aspectRatio: `${result.width} / ${result.height}` }}
            >
              <Image
                src={result.src}
                alt={result.alt}
                fill
                sizes="(max-width: 1280px) 270px, 200px"
                className="object-cover"
              />

              {sources.map((source, index) => (
                <span
                  key={source.image.src}
                  className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent font-mono text-[10px] font-bold text-accent-foreground ring-2 ring-black/40"
                  style={{ left: `${source.pin.left}%`, top: `${source.pin.top}%` }}
                  title={`${index + 1} — ${source.label}`}
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <figcaption className="mt-2.5 text-[11.5px] leading-snug text-text-dim">
              Each pin marks the part of the render that came from the matching input.
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
