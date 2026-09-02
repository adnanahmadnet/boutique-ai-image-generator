"use client";

import { useState } from "react";
import { IconDownload, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export default function DownloadCard({ orderId, label }: { orderId: string; label: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

  const handleClick = async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/downloads/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const body = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Unable to get a download link." });
        return;
      }

      setState({ status: "ready", url: body.downloadUrl });
    } catch {
      setState({ status: "error", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5">
      <span className="font-heading text-[13.5px] font-semibold text-text">{label}</span>

      {state.status === "ready" ? (
        <a
          href={state.url}
          className="inline-flex w-fit items-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
        >
          <IconDownload size={15} />
          Download now (expires in 30 min)
        </a>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={state.status === "loading"}
          className="inline-flex w-fit items-center gap-2 rounded-default border border-border-hover px-4 py-2.5 text-[13px] text-text transition-colors hover:bg-surface-2 disabled:opacity-50"
        >
          {state.status === "loading" ? (
            <IconLoader2 size={15} className="animate-spin" />
          ) : (
            <IconDownload size={15} />
          )}
          Get download link
        </button>
      )}

      {state.status === "error" ? (
        <p className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
