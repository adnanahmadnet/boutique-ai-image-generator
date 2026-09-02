"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import type { FaqItem } from "@/data/faq";

export default function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-heading text-[14.5px] font-semibold text-text">
                {item.question}
              </span>
              <IconChevronDown
                size={18}
                className={`shrink-0 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <div className="border-t border-border px-5 py-4">
                <p className="text-[13.5px] leading-relaxed text-text-muted">{item.answer}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
