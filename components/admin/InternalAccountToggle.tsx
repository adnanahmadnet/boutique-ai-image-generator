"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

export default function InternalAccountToggle({
  userId,
  isInternal,
}: {
  userId: string;
  isInternal: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isInternal: !isInternal }),
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
        isInternal
          ? "border-accent/30 bg-accent-dim text-accent hover:opacity-90"
          : "border-border text-text-muted hover:border-border-hover hover:text-text"
      }`}
    >
      {submitting ? <IconLoader2 size={13} className="animate-spin" /> : null}
      {isInternal ? "Marked as internal — unmark" : "Mark as internal test account"}
    </button>
  );
}
