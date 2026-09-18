"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconCheck, IconLoader2 } from "@tabler/icons-react";

export default function CompleteRequestControls({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/requests/${requestId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Unable to close this request.");
        setSubmitting(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="inline-flex w-fit items-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
      >
        <IconCheck size={15} />
        Mark as Support done
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
          Notes (optional)
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="What was covered, anything to follow up on…"
          className="rounded-default border border-border bg-surface-2 px-3 py-2 text-[13px] text-text outline-none placeholder:text-text-dim"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleComplete}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? <IconLoader2 size={15} className="animate-spin" /> : <IconCheck size={15} />}
          Confirm — Support done
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[12.5px] text-text-muted underline hover:text-text"
        >
          Cancel
        </button>
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
