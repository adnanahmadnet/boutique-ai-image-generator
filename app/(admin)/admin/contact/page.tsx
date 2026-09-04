import Link from "next/link";
import { IconUserCircle } from "@tabler/icons-react";
import { createAdminClient } from "@/lib/supabase/admin";
import ReplyForm from "@/components/admin/ReplyForm";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const admin = createAdminClient();
  const { data: messages } = await admin
    .from("contact_messages")
    .select("id, buyer_id, name, email, subject, message, reply, replied_at, status, created_at")
    .order("created_at", { ascending: false });

  const rows = messages ?? [];

  const newIds = rows.filter((m) => m.status === "new").map((m) => m.id as string);
  if (newIds.length > 0) {
    await admin.from("contact_messages").update({ status: "read" }).in("id", newIds);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Contact messages</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">{rows.length} received.</p>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((message) => (
          <div key={message.id as string} className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-[14px] font-semibold text-text">
                  {message.name as string}
                </span>
                <span className="text-[12.5px] text-text-dim">{message.email as string}</span>
                {message.buyer_id ? (
                  <Link
                    href={`/admin/users/${message.buyer_id}`}
                    className="ml-1 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent hover:opacity-80"
                    title="View this buyer's account"
                  >
                    <IconUserCircle size={12} />
                    Account
                  </Link>
                ) : (
                  <span className="ml-1 font-mono text-[10px] uppercase tracking-wide text-text-dim">
                    Guest
                  </span>
                )}
              </div>
              <span className="font-mono text-[11px] text-text-dim">
                {new Date(message.created_at as string).toLocaleString()}
              </span>
            </div>
            {message.subject ? (
              <p className="mt-2 font-heading text-[13px] font-semibold text-text-muted">
                {message.subject as string}
              </p>
            ) : null}
            <p className="mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text-muted">
              {message.message as string}
            </p>
            <span
              className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide ${
                message.status === "new"
                  ? "border-accent/30 bg-accent-dim text-accent"
                  : "border-border bg-surface-2 text-text-muted"
              }`}
            >
              {message.status as string}
            </span>

            {message.reply ? (
              <div className="mt-4 rounded-default border border-success/30 bg-success-dim p-4">
                <span className="font-mono text-[10.5px] uppercase tracking-wide text-success">
                  Your reply
                </span>
                <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text">
                  {message.reply as string}
                </p>
              </div>
            ) : (
              <ReplyForm messageId={message.id as string} />
            )}
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-[13.5px] text-text-muted">
            No messages yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
