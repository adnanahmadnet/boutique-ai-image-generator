"use client";

import { useCallback, useId, useRef, useState } from "react";
import Image from "next/image";
import { IconArrowsHorizontal } from "@tabler/icons-react";
import type { GalleryImage } from "@/data/gallery";

export default function BeforeAfterSlider({
  before,
  after,
}: {
  before: GalleryImage;
  after: GalleryImage;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const labelId = useId();

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      setPosition((p) => Math.max(0, p - 5));
    } else if (e.key === "ArrowRight") {
      setPosition((p) => Math.min(100, p + 5));
    }
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[893/1600] w-full max-w-md touch-none overflow-hidden rounded-lg border border-border select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Image
        src={after.src}
        alt={after.alt}
        fill
        priority
        sizes="(max-width: 640px) 90vw, 448px"
        className="object-cover"
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={before.src}
          alt={before.alt}
          fill
          priority
          sizes="(max-width: 640px) 90vw, 448px"
          className="object-cover"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white/70"
        style={{ left: `${position}%` }}
      />

      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        onKeyDown={handleKeyDown}
        className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border-hover bg-surface text-text shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ left: `${position}%` }}
      >
        <IconArrowsHorizontal size={16} />
      </div>

      <span id={labelId} className="sr-only">
        Drag to compare the product photo with the AI-generated result
      </span>

      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-text-muted backdrop-blur-sm">
        Input
      </div>
      <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-accent/30 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-accent backdrop-blur-sm">
        AI output
      </div>
    </div>
  );
}
