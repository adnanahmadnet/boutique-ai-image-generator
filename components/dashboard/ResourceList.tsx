"use client";

import { useState } from "react";
import { IconChevronDown, IconLock, IconFileText } from "@tabler/icons-react";
import { RESOURCE_FILES } from "@/data/resources";

export default function ResourceList({ unlocked }: { unlocked: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {RESOURCE_FILES.map((file) => {
        const isOpen = openId === file.id;
        return (
          <div
            key={file.id}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : file.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-default bg-accent-dim text-accent">
                  {unlocked ? <IconFileText size={16} /> : <IconLock size={14} />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-heading text-[14px] font-semibold text-text">
                      {file.label}
                    </span>
                    <span className="truncate font-mono text-[11px] text-text-dim">
                      {file.filename}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-muted">
                    {file.description}
                  </p>
                </div>
              </div>
              <IconChevronDown
                size={16}
                className={`mt-1 shrink-0 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-border px-5 py-4">
                <p className="mb-2 font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
                  Setup steps
                </p>
                <ol className="flex flex-col gap-1.5">
                  {file.setupSteps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-text-muted">
                      <span className="text-text-dim">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
