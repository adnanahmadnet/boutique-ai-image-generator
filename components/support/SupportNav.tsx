import Link from "next/link";
import { SITE } from "@/data/site";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default function SupportNav({ agentName }: { agentName: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link href="/" className="font-heading text-[15px] font-bold text-text">
          {SITE.brand}
          <span className="ml-2 rounded-full border border-accent/30 bg-accent-dim px-2 py-0.5 font-mono text-[10px] font-normal text-accent">
            SUPPORT
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-text-muted">{agentName}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
