"use client";

import { useState, type FormEvent } from "react";
import { IconMail, IconLoader2, IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type FormState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-start gap-2 rounded-default border border-border bg-surface-2 p-4 text-[13px] text-text-muted">
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>Login isn&apos;t configured yet — Supabase credentials are missing.</span>
      </div>
    );
  }

  if (state.status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-default border border-success/30 bg-success-dim p-6 text-center">
        <IconCheck size={20} className="text-success" />
        <p className="text-[13.5px] text-text-muted">
          Check <span className="text-text">{email}</span> for a login link.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "sending" });

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Unable to send login link." });
        return;
      }

      setState({ status: "sent" });
    } catch {
      setState({ status: "error", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Email
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface px-3.5 py-3">
          <IconMail size={16} className="text-text-dim" />
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@boutique.com"
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={state.status === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state.status === "sending" ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : null}
        Send magic link
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
