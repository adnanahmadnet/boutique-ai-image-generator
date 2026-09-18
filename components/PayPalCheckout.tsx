"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  IconAlertTriangle,
  IconLoader2,
  IconMail,
  IconBuildingStore,
  IconCheck,
} from "@tabler/icons-react";
import { PRICING, SUPPORT_ADDON } from "@/data/pricing";

// Live payment isn't wired up yet (PayPal is sandbox-only). Flip this back
// to true once real PayPal credentials are live — the full checkout flow
// below is untouched and ready to go, this just skips it for now in favor
// of a plain lead-capture form that hands off to manual follow-up.
const PAYMENTS_ENABLED = false;

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const POLL_INTERVAL_MS = 3000;
const POLL_MAX_ATTEMPTS = 40; // ~2 minutes

type Stage =
  | { stage: "form" }
  | { stage: "ready"; paypalOrderId: string; orderId: string }
  | { stage: "confirming"; orderId: string }
  | { stage: "completed" }
  | { stage: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-default border border-danger/30 bg-danger-dim p-3 text-[13px] text-danger">
      <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function CheckoutForm({
  onCreated,
}: {
  onCreated: (paypalOrderId: string, orderId: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [boutiqueName, setBoutiqueName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, boutiqueName }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Unable to start checkout.");
        setSubmitting(false);
        return;
      }

      onCreated(body.id, body.orderId);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Email *
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface-2 px-3.5 py-3">
          <IconMail size={16} className="text-text-dim" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@boutique.com"
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Boutique name (optional)
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface-2 px-3.5 py-3">
          <IconBuildingStore size={16} className="text-text-dim" />
          <input
            type="text"
            value={boutiqueName}
            onChange={(e) => setBoutiqueName(e.target.value)}
            placeholder="Your boutique's name"
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3.5 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? <IconLoader2 size={16} className="animate-spin" /> : null}
        Continue to PayPal
      </button>

      {error ? <ErrorBox message={error} /> : null}
    </form>
  );
}

// Interim flow while live payment isn't wired up: grants dashboard access
// right away (see app/api/orders/interim-checkout) instead of waiting on a
// PayPal capture, and notifies the team so payment — and support, if
// requested — gets arranged manually. Goes straight to the dashboard for an
// already-logged-in buyer; sends a not-yet-logged-in one to create an
// account first, which claims the same order automatically on signup.
function LeadCaptureForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [addSupport, setAddSupport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const total = Number(PRICING.amount) + (addSupport ? Number(SUPPORT_ADDON.amount) : 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/interim-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, addSupport }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    const destination = isLoggedIn ? "/dashboard/downloads" : "/signup?redirectTo=/dashboard/downloads";

    return (
      <div className="flex flex-col items-center gap-3 rounded-default border border-success/30 bg-success-dim p-6 text-center">
        <IconCheck size={20} className="text-success" />
        <p className="text-[13.5px] text-text-muted">
          You&apos;re in — the pipeline is unlocked in your dashboard.
          {addSupport ? " Our support team will contact you shortly to get everything set up." : ""}
        </p>
        <button
          type="button"
          onClick={() => {
            router.push(destination);
            router.refresh();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
        >
          {isLoggedIn ? "Go to dashboard" : "Create your account"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-text-dim">
          Email *
        </span>
        <div className="flex items-center gap-2 rounded-default border border-border bg-surface-2 px-3.5 py-3">
          <IconMail size={16} className="text-text-dim" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@boutique.com"
            className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-default border border-accent/30 bg-accent-dim p-3.5">
        <input
          type="checkbox"
          checked={addSupport}
          onChange={(e) => setAddSupport(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-accent"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-heading text-[13.5px] font-semibold text-text">
            + {SUPPORT_ADDON.label} — ${SUPPORT_ADDON.amount.split(".")[0]}
          </span>
          <span className="text-[12.5px] leading-snug text-text-muted">
            {SUPPORT_ADDON.description} Selecting this means our support team will contact you as
            soon as possible after you continue.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-between rounded-default border border-border bg-surface-2 px-3.5 py-3">
        <span className="text-[13px] text-text-muted">Total</span>
        <span className="font-mono text-lg text-text">
          ${total.toFixed(2)} {PRICING.currency}
        </span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-default bg-accent px-5 py-3.5 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? <IconLoader2 size={16} className="animate-spin" /> : null}
        Continue
      </button>

      {error ? <ErrorBox message={error} /> : null}
    </form>
  );
}

export default function PayPalCheckout({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  if (!PAYMENTS_ENABLED) {
    return <LeadCaptureForm isLoggedIn={isLoggedIn} />;
  }

  return <PayPalCheckoutLive />;
}

function PayPalCheckoutLive() {
  const [state, setState] = useState<Stage>({ stage: "form" });
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, []);

  const pollStatus = (orderId: string, attempt = 0) => {
    if (attempt >= POLL_MAX_ATTEMPTS) {
      setState({
        stage: "error",
        message:
          "Still confirming your payment. This can take a minute — check your email shortly, or contact support if it doesn't arrive.",
      });
      return;
    }

    pollTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/status?orderId=${orderId}`);
        const body = await res.json();

        if (body.status === "completed") {
          setState({ stage: "completed" });
          return;
        }
        if (body.status === "failed" || body.status === "refunded") {
          setState({ stage: "error", message: "Your payment could not be completed." });
          return;
        }
      } catch {
        // transient — keep polling
      }
      pollStatus(orderId, attempt + 1);
    }, POLL_INTERVAL_MS);
  };

  if (!CLIENT_ID) {
    return (
      <div className="flex items-start gap-2 rounded-default border border-border bg-surface-2 p-4 text-[13px] text-text-muted">
        <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>
          PayPal Sandbox isn&apos;t configured yet. Set{" "}
          <code className="font-mono text-accent">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>{" "}
          in <code className="font-mono">.env.local</code> to enable checkout.
        </span>
      </div>
    );
  }

  if (state.stage === "form") {
    return (
      <CheckoutForm
        onCreated={(paypalOrderId, orderId) => setState({ stage: "ready", paypalOrderId, orderId })}
      />
    );
  }

  if (state.stage === "completed") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-default border border-success/30 bg-success-dim p-6 text-center">
        <IconCheck size={20} className="text-success" />
        <p className="text-[13.5px] text-text-muted">
          Payment confirmed. Check your email for your license key and download link, or{" "}
          <a href="/login" className="text-accent hover:opacity-80">
            log in to your dashboard
          </a>
          .
        </p>
      </div>
    );
  }

  if (state.stage === "error") {
    return (
      <div className="flex flex-col gap-3">
        <ErrorBox message={state.message} />
        <button
          type="button"
          onClick={() => setState({ stage: "form" })}
          className="text-[13px] text-text-muted underline hover:text-text"
        >
          Start over
        </button>
      </div>
    );
  }

  if (state.stage === "confirming") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-default border border-border bg-surface-2 p-4 text-[13px] text-text-muted">
        <IconLoader2 size={16} className="animate-spin" />
        Payment received — finalizing your order…
      </div>
    );
  }

  // state.stage === "ready"
  return (
    <PayPalScriptProvider
      options={{ clientId: CLIENT_ID, currency: PRICING.currency, intent: "capture" }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
        createOrder={async () => state.paypalOrderId}
        onApprove={async (data) => {
          const orderId = state.orderId;
          try {
            await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });
          } catch {
            // Client capture is a UX fast-path only — the webhook is the
            // source of truth, so keep polling regardless of this outcome.
          }
          setState({ stage: "confirming", orderId });
          pollStatus(orderId);
        }}
        onCancel={() => setState({ stage: "form" })}
        onError={() =>
          setState({ stage: "error", message: "PayPal ran into an error. Please try again." })
        }
      />
    </PayPalScriptProvider>
  );
}
