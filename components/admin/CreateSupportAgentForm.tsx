"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconAlertTriangle, IconLoader2, IconUserPlus } from "@tabler/icons-react";

export default function CreateSupportAgentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/support-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Unable to create this account.");
        setSubmitting(false);
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6"
    >
      <h3 className="font-heading text-[14px] font-semibold text-text">
        Create a support team account
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            className="rounded-default border border-border bg-surface-2 px-3 py-2.5 text-[13px] text-text outline-none placeholder:text-text-dim"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@yourcompany.com"
            className="rounded-default border border-border bg-surface-2 px-3 py-2.5 text-[13px] text-text outline-none placeholder:text-text-dim"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] uppercase tracking-wide text-text-dim">
            Password
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="rounded-default border border-border bg-surface-2 px-3 py-2.5 text-[13px] text-text outline-none placeholder:text-text-dim"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? (
          <IconLoader2 size={15} className="animate-spin" />
        ) : (
          <IconUserPlus size={15} />
        )}
        Create account
      </button>
      {error ? (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {error}
        </p>
      ) : null}
    </form>
  );
}
