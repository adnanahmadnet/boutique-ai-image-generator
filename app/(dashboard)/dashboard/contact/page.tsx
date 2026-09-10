import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-current-user";
import AuthenticatedContactForm from "@/components/dashboard/AuthenticatedContactForm";

export default async function DashboardContactPage() {
  const user = await getCurrentUser();

  const messages = user
    ? await query<{
        id: string;
        subject: string | null;
        message: string;
        reply: string | null;
        replied_at: string | null;
        reply_seen_at: string | null;
        status: string;
        created_at: string;
      }>(
        `select id, subject, message, reply, replied_at, reply_seen_at, status, created_at
         from public.contact_messages
         where buyer_id = $1
         order by created_at desc`,
        [user.id]
      )
    : [];

  // Note which replies were still unseen before we mark them seen below, so
  // the page can still highlight what's "new" on this very load.
  const unseenIds = new Set(
    messages.filter((m) => m.reply && !m.reply_seen_at).map((m) => m.id)
  );

  if (user && unseenIds.size > 0) {
    await query(
      `update public.contact_messages set reply_seen_at = now()
       where buyer_id = $1 and reply is not null and reply_seen_at is null`,
      [user.id]
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-xl font-bold text-text">Contact</h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Questions about setup, your order, or anything else — we&apos;ll reply here.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <AuthenticatedContactForm />
      </div>

      {messages.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-[15px] font-semibold text-text">Your messages</h2>
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-heading text-[13.5px] font-semibold text-text">
                  {msg.subject || "No subject"}
                </span>
                <span className="font-mono text-[11px] text-text-dim">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text-muted">
                {msg.message}
              </p>

              {msg.reply ? (
                <div className="mt-4 rounded-default border border-accent/30 bg-accent-dim p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-wide text-accent">
                      Reply
                    </span>
                    {unseenIds.has(msg.id) ? (
                      <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase leading-none tracking-wide text-accent-foreground">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-text">
                    {msg.reply}
                  </p>
                </div>
              ) : (
                <span className="mt-3 inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
                  Awaiting reply
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
