"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";

export default function LicenseKeyCard({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — the key
      // is still visible and selectable, so this is a soft failure.
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
        License key
      </span>
      <div className="flex items-center justify-between gap-3 rounded-default border border-border bg-surface-2 px-4 py-3">
        <span className="select-all font-mono text-[14px] text-accent">{licenseKey}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy license key"
          className="shrink-0 text-text-dim transition-colors hover:text-text"
        >
          {copied ? <IconCheck size={15} className="text-success" /> : <IconCopy size={15} />}
        </button>
      </div>
    </div>
  );
}
