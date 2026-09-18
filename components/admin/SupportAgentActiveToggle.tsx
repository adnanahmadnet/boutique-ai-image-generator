"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

export default function SupportAgentActiveToggle({
  agentId,
  isActive,
}: {
  agentId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/support-agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      className={`inline-flex items-center gap-1.5 rounded-default border px-2.5 py-1.5 text-[12px] transition-colors disabled:opacity-50 ${
        isActive
          ? "border-border text-text-muted hover:border-danger/40 hover:text-danger"
          : "border-accent/30 bg-accent-dim text-accent hover:opacity-90"
      }`}
    >
      {submitting ? <IconLoader2 size={13} className="animate-spin" /> : null}
      {isActive ? "Deactivate" : "Reactivate"}
    </button>
  );
}
