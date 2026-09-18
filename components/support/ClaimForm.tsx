"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";

export default function ClaimForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!scheduledAt) {
      setError("Pick a date and time.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/support/requests/${requestId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // datetime-local has no timezone — interpret it as the agent's own
        // local time, then convert to an absolute instant before sending.
        body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Unable to claim this request.");
        setSubmitting(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Contact time
          </span>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="rounded-default border border-border bg-surface-2 px-3 py-2 text-[13px] text-text outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? <IconLoader2 size={15} className="animate-spin" /> : null}
          Claim & schedule
        </button>
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {error}
        </p>
      ) : null}
    </form>
  );
}
