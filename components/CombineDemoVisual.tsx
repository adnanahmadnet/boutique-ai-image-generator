"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { COMBINE_DEMO } from "@/data/gallery";

type Phase = "spread" | "converge" | "pop" | "reveal";

const PHASE_ORDER: Phase[] = ["spread", "converge", "pop", "reveal"];

// How long each phase stays on screen before advancing to the next.
const PHASE_DURATION_MS: Record<Phase, number> = {
  spread: 1700,
  converge: 650,
  pop: 350,
  reveal: 3200,
};

const STATUS_TEXT: Record<Phase, string> = {
  spread: "3 inputs: shirt, pants, and a reference pose",
  converge: "Combining…",
  pop: "Combining…",
  reveal: "AI-generated result",
};

// Resting corner position (percent of the frame) and tilt for each input
// thumbnail while they're still spread out. Positions are pushed toward the
// edges so the cards can be large enough to actually read as garments
// without the three of them colliding — see CARD_WIDTH below.
const CARDS = [
  { key: "shirt", image: COMBINE_DEMO.shirt, left: 24, top: 23, rotate: -8 },
  { key: "pant", image: COMBINE_DEMO.pant, left: 76, top: 23, rotate: 8 },
  { key: "pose", image: COMBINE_DEMO.pose, left: 50, top: 74, rotate: 0 },
] as const;

// Width of each input thumbnail, as a percentage of the frame width.
const CARD_WIDTH = 38;

// Three inputs spread out, converge to center, pop, then cross-fade into the
// finished AI result. Sized via `className` so it can drop into the hero
// (next to the headline) or stand alone as a full-width section visual.
export default function CombineDemoVisual({ className = "max-w-xs" }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>("spread");

  useEffect(() => {
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      timeoutId = setTimeout(() => {
        index = (index + 1) % PHASE_ORDER.length;
        setPhase(PHASE_ORDER[index]);
        tick();
      }, PHASE_DURATION_MS[PHASE_ORDER[index]]);
    };

    tick();
    return () => clearTimeout(timeoutId);
  }, []);

  const merged = phase !== "spread";
  const thumbsHidden = phase === "pop" || phase === "reveal";
  const revealed = phase === "reveal";

  return (
    <div className={`flex w-full flex-col items-center gap-4 ${className}`}>
      <div
        className="relative aspect-[900/1613] w-full overflow-hidden rounded-lg border border-border bg-surface"
        aria-hidden
      >
        <div
          className="absolute inset-0 transition-[opacity,transform] duration-700 ease-out"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.92)",
          }}
        >
          <Image
            src={COMBINE_DEMO.result.src}
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 90vw, 448px"
            className="object-cover"
          />
        </div>

        {phase === "pop" ? (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 rounded-full bg-accent"
            style={{ animation: "combine-pop-burst 350ms ease-out forwards" }}
          />
        ) : null}

        {CARDS.map((card) => {
          const left = merged ? 50 : card.left;
          const top = merged ? 50 : card.top;
          const rotate = merged ? 0 : card.rotate;
          const scale = phase === "spread" ? 1 : phase === "converge" ? 0.4 : 0.12;

          return (
            <div
              key={card.key}
              className="absolute aspect-[3/4] overflow-hidden rounded-md border border-border-hover bg-surface-2 shadow-lg transition-[left,top,transform,opacity] duration-500 ease-in-out"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${CARD_WIDTH}%`,
                transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
                opacity: thumbsHidden ? 0 : 1,
              }}
            >
              <Image src={card.image.src} alt="" fill priority sizes="200px" className="object-cover" />
            </div>
          );
        })}

        <div
          className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-text-muted backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: phase === "spread" ? 1 : 0 }}
        >
          Input
        </div>
        <div
          className="pointer-events-none absolute right-3 top-3 rounded-full border border-accent/30 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-accent backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: revealed ? 1 : 0 }}
        >
          AI output
        </div>
      </div>

      <p
        role="status"
        className="min-h-[1.5em] text-center font-mono text-[11px] uppercase tracking-wide text-text-dim"
      >
        {STATUS_TEXT[phase]}
      </p>
    </div>
  );
}
