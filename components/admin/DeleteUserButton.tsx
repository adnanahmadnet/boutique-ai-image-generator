"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";

export default function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${email}? This can't be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error ?? "Unable to delete user.");
        setDeleting(false);
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-2 rounded-default border border-danger/30 bg-danger-dim px-4 py-2.5 text-[13px] font-semibold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
      >
        {deleting ? <IconLoader2 size={15} className="animate-spin" /> : <IconTrash size={15} />}
        Delete user
      </button>
      {error ? (
        <div className="flex items-center gap-1.5 text-[12px] text-danger">
          <IconAlertTriangle size={13} />
          {error}
        </div>
      ) : null}
    </div>
  );
}
