"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconAlertTriangle, IconCheck } from "@tabler/icons-react";

type FormState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

export default function AuthenticatedContactForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-default border border-success/30 bg-success-dim p-6 text-center">
        <IconCheck size={20} className="text-success" />
        <p className="text-[13.5px] text-text-muted">
          Sent — we&apos;ll reply here and by email.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const body = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Unable to send your message." });
        return;
      }

      setState({ status: "sent" });
      setSubject("");
      setMessage("");
      router.refresh();
    } catch {
      setState({ status: "error", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Subject
        </span>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What's this about?"
          className="rounded-default border border-border bg-surface-2 px-3.5 py-3 text-[14px] text-text outline-none placeholder:text-text-dim focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Message
        </span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="resize-y rounded-default border border-border bg-surface-2 px-3.5 py-3 text-[14px] text-text outline-none focus:border-accent"
        />
      </label>

      <button
        type="submit"
        disabled={state.status === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state.status === "sending" ? <IconLoader2 size={16} className="animate-spin" /> : null}
        Send message
      </button>

      {state.status === "error" ? (
        <div className="flex items-start gap-2 rounded-default border border-danger/30 bg-danger-dim p-3 text-[13px] text-danger">
          <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      ) : null}
    </form>
  );
}
