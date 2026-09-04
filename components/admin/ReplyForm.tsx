"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconAlertTriangle, IconSend } from "@tabler/icons-react";

export default function ReplyForm({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [state, setState] = useState<
    { status: "idle" } | { status: "sending" } | { status: "error"; message: string }
  >({ status: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "sending" });

    try {
      const res = await fetch(`/api/admin/contact/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const body = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: body.error ?? "Unable to send reply." });
        return;
      }

      setReply("");
      router.refresh();
    } catch {
      setState({ status: "error", message: "Something went wrong. Please try again." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <textarea
        required
        rows={3}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        placeholder="Write a reply…"
        className="resize-y rounded-default border border-border bg-surface-2 px-3.5 py-3 text-[13.5px] text-text outline-none placeholder:text-text-dim focus:border-accent"
      />
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="inline-flex w-fit items-center gap-2 rounded-default bg-accent px-4 py-2.5 font-heading text-[13px] font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state.status === "sending" ? (
          <IconLoader2 size={15} className="animate-spin" />
        ) : (
          <IconSend size={15} />
        )}
        Send reply
      </button>
      {state.status === "error" ? (
        <div className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {state.message}
        </div>
      ) : null}
    </form>
  );
}
