"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import Image from "next/image";
import type { StyleCard } from "@/data/styles";

const AUTOPLAY_MS = 2600;
// How many cards are shown on each side of the active one — anything
// further away is faded out and removed from interaction.
const MAX_VISIBLE_OFFSET = 2;
// How quickly the rendered fan position catches up to wherever it's meant
// to be, each animation frame. Lower = smoother/more trailing, higher =
// snappier. This (not a CSS transition) is what drives cursor-following —
// a CSS transition restarts every time the cursor crosses into a new card's
// zone, which is what made the old version feel stepped instead of fluid.
const LERP_FACTOR = 0.16;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SIZE_TRANSITION = `width 550ms ${EASE}, height 550ms ${EASE}, box-shadow 300ms ease`;
const CONTAINER_TRANSITION = `height 550ms ${EASE}`;
// Resting height of the fan when nothing is zoomed in.
const BASE_HEIGHT = 340;

// Shortest signed distance from `index` to `position` around the ring, e.g.
// with 5 cards, index 4 sits at offset -1 from position 0, not +4. Works for
// fractional `position` too, which is what makes in-between frames possible.
function ringDelta(index: number, position: number, total: number) {
  let diff = (index - position) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

// A photo's natural aspect ratio (width / height), or the card's default
// 3:4 thumbnail crop when it has no image yet.
function aspectOf(card: StyleCard) {
  return card.image ? card.image.width / card.image.height : 3 / 4;
}

// How wide the zoomed-in card should render. Read only while zoomed (a
// client-only interaction), so this never runs during SSR/hydration.
function zoomWidthFor() {
  return typeof window !== "undefined" && window.innerWidth < 640 ? 210 : 260;
}

function cardTransform(offset: number, distance: number) {
  const translateX = offset * 90;
  const translateY = distance * 22;
  const rotate = offset * 12;
  const scale = 1 - distance * 0.09;
  return `translateX(-50%) translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`;
}

// A stack of cards fanned out in an arc — the transition from the
// fan-carousel-v1 reference. Autoplays through the front-and-center card;
// moving the cursor across the row scrubs through cards, following the
// cursor continuously frame-by-frame rather than snapping in discrete
// steps; clicking a card grows its box to the photo's true proportions so
// nothing gets cropped.
export default function FanCarousel({ cards }: { cards: StyleCard[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const total = cards.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // `targetPosition` is where the fan is headed (set by the cursor, a
  // click, or autoplay); `currentPosition` is the smoothed value actually
  // rendered, eased toward the target every frame.
  const targetPosition = useRef(0);
  const currentPosition = useRef(0);
  const zoomedRef = useRef(zoomed);
  const activeRef = useRef(active);

  useEffect(() => {
    zoomedRef.current = zoomed;
  }, [zoomed]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Keep the animation target in sync with the logical active card for
  // every non-cursor-driven change (autoplay, initial mount). Cursor moves
  // and clicks set targetPosition.current directly instead, so this only
  // matters while the user isn't actively scrubbing.
  useEffect(() => {
    if (!hovering) {
      targetPosition.current = active;
    }
  }, [active, hovering]);

  const advance = useCallback(() => {
    setActive((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || hovering || zoomed) return;
    const id = setInterval(advance, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [advance, total, hovering, zoomed]);

  // Every frame, ease the rendered position toward the target and write
  // transforms straight to the DOM — smoother than round-tripping through
  // React state and a CSS transition for a value that changes this often.
  useEffect(() => {
    let frameId: number;

    const tick = () => {
      const delta = ringDelta(targetPosition.current, currentPosition.current, total);
      currentPosition.current =
        (currentPosition.current + delta * LERP_FACTOR + total) % total;

      // While zoomed, `active` is pinned to whatever the click set — don't
      // let rounding here fight that (it briefly disagrees while the fan is
      // still gliding toward the clicked card, which flickered the zoomed
      // card between neighbors before this guard).
      if (!zoomedRef.current) {
        const rounded = Math.round(currentPosition.current) % total;
        setActive((prev) => (prev === rounded ? prev : rounded));
      }

      cards.forEach((_, index) => {
        const el = cardRefs.current[index];
        if (!el) return;

        const offset = ringDelta(index, currentPosition.current, total);
        const distance = Math.abs(offset);
        const isHidden = distance > MAX_VISIBLE_OFFSET;
        const isZoomedCard = distance < 0.02 && zoomedRef.current;

        el.style.transform = cardTransform(offset, distance);
        el.style.zIndex = String(isZoomedCard ? 20 : Math.round(10 - Math.min(distance, MAX_VISIBLE_OFFSET)));
        el.style.opacity = isHidden ? "0" : "1";
        el.style.pointerEvents = isHidden ? "none" : "";
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [cards, total]);

  // Scrub through cards by cursor position: the left edge of the row
  // targets the first card, the right edge the last, and the fan eases
  // toward wherever that is every frame — so it visibly follows the cursor
  // rather than jumping between fixed stops.
  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (zoomedRef.current || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, relativeX));
    targetPosition.current = clamped * (total - 1);
  };

  // Clicking a card brings it to front and grows it in place; clicking the
  // card that's already front-and-center shrinks it back.
  const handleCardClick = (index: number) => {
    setZoomed((wasZoomed) => (index === active ? !wasZoomed : true));
    setActive(index);
    targetPosition.current = index;
  };

  const zoomWidth = zoomWidthFor();
  const zoomedCardHeight = zoomWidth / aspectOf(cards[active]);
  // Top offset (12px, matching each card's `top-3`) plus a little breathing
  // room below, so the grown box never gets clipped by the container. Height
  // is always set inline (not via a Tailwind class) so there's a single
  // source of truth for both states and the transition between them.
  const containerStyle: CSSProperties = {
    height: zoomed ? `${zoomedCardHeight + 36}px` : `${BASE_HEIGHT}px`,
    transition: CONTAINER_TRANSITION,
  };

  return (
    <div
      ref={rootRef}
      className="flex w-full flex-col items-center gap-7"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setZoomed(false);
        targetPosition.current = Math.round(currentPosition.current) % total;
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="relative w-full max-w-[720px] shrink-0 overflow-hidden"
        style={containerStyle}
        role="group"
        aria-label="Photoshoot style preview"
      >
        {cards.map((card, index) => {
          const offset = ringDelta(index, active, total);
          const distance = Math.abs(offset);
          const isActive = distance === 0;
          const isHidden = distance > MAX_VISIBLE_OFFSET;
          const isZoomedCard = isActive && zoomed;

          return (
            <button
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el;
                // Set the initial transform synchronously on mount so the
                // very first paint already matches the fan layout, instead
                // of waiting a frame for the animation loop to catch up.
                if (el && !el.style.transform) {
                  el.style.transform = cardTransform(offset, distance);
                  el.style.zIndex = String(Math.round(10 - Math.min(distance, MAX_VISIBLE_OFFSET)));
                  el.style.opacity = isHidden ? "0" : "1";
                }
              }}
              type="button"
              aria-hidden={isHidden}
              aria-pressed={isZoomedCard}
              aria-label={`${isZoomedCard ? "Shrink" : "Enlarge"} ${card.title} preview`}
              tabIndex={isHidden ? -1 : 0}
              onClick={() => handleCardClick(index)}
              className={`absolute left-1/2 top-3 aspect-[3/4] w-[180px] cursor-pointer overflow-hidden rounded-lg border text-left shadow-xl sm:w-[204px] ${
                isActive ? "border-border-hover" : "border-border"
              } ${isZoomedCard ? "shadow-2xl ring-1 ring-accent/50" : ""}`}
              style={{
                width: isZoomedCard ? `${zoomWidth}px` : undefined,
                height: isZoomedCard ? `${zoomWidth / aspectOf(card)}px` : undefined,
                transition: SIZE_TRANSITION,
              }}
            >
              {card.image ? (
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-linear-to-br ${card.gradient}`} />
              )}
              {!isActive ? <div className="absolute inset-0 bg-black/40" /> : null}

              <div className="absolute inset-x-0 top-0 flex justify-end p-3.5">
                <span className="shrink-0 rounded-full border border-white/25 bg-black/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-white/80">
                  {card.tag}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/25 to-transparent p-3.5 pt-10">
                <span className="block font-heading text-[13px] font-semibold text-white">
                  {card.title}
                </span>
                <span className="text-[11px] text-white/70">{card.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a style">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Show ${card.title}`}
            onClick={() => {
              setActive(index);
              setZoomed(false);
              targetPosition.current = index;
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active ? "w-5 bg-accent" : "w-1.5 bg-border-hover"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
