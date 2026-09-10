"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  IconMail,
  IconLock,
  IconUser,
  IconLoader2,
  IconAlertTriangle,
  IconCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "needs-confirmation" }
  | { status: "error"; message: string };

export default function PasswordAuthForm({
  mode,
  redirectTo = "/",
  isConfigured = true,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  isConfigured?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<FormState>({ status: "idle" });

  if (!isConfigured) {
    return (
      <div className="flex items-start gap-2 rounded-default border border-border bg-surface-2 p-4 text-[13px] text-text-muted">
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>
          {mode === "signup" ? "Sign up" : "Login"} isn&apos;t configured yet — the database isn&apos;t
          reachable.
        </span>
      </div>
    );
  }

  if (state.status === "needs-confirmation") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-default border border-success/30 bg-success-dim p-6 text-center">
        <IconCheck size={20} className="text-success" />
        <p className="text-[13.5px] text-text-muted">
          Account created. Check <span className="text-text">{email}</span> to confirm it before
          logging in.
        </p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "submitting" });

    const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        setState({
          status: "error",
          message: body.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      if (mode === "signup" && body.needsConfirmation) {
        setState({ status: "needs-confirmation" });
        return;
      }

      // Login is shared by both identities: /api/auth/login checks the admin
      // table first and tells us which kind of session it created, so the
      // admin lands in /admin and everyone else goes where they were headed.
      // Signup never returns isAdmin — it can only ever create a buyer.
      router.push(body.isAdmin ? "/admin" : redirectTo);
      router.refresh();
    } catch {
      setState({ status: "error", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {mode === "signup" ? (
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
            Name
          </span>
          <div className="flex items-center gap-2 rounded-default border border-border bg-surface px-3.5 py-3">
            <IconUser size={16} className="text-text-dim" />
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
            />
          </div>
        </label>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Email
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface px-3.5 py-3">
          <IconMail size={16} className="text-text-dim" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@boutique.com"
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Password
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface px-3.5 py-3">
          <IconLock size={16} className="text-text-dim" />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="shrink-0 text-text-dim hover:text-text"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3 font-heading text-sm leading-none font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state.status === "submitting" ? (
          <IconLoader2 size={16} className="animate-spin" />
        ) : null}
        {mode === "signup" ? "Create account" : "Log in"}
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
