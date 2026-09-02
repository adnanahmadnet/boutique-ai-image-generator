import { IconCheck, IconDownload } from "@tabler/icons-react";

export default function DownloadSuccess({ downloadUrl }: { downloadUrl: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-default border border-success/30 bg-success-dim p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
        <IconCheck size={20} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-sm font-semibold text-text">
          Payment confirmed
        </p>
        <p className="text-[13px] text-text-muted">
          Your download link is ready and expires in 15 minutes.
        </p>
      </div>
      <a
        href={downloadUrl}
        className="inline-flex items-center gap-2 rounded-default bg-accent px-5 py-2.5 font-heading text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
      >
        <IconDownload size={16} />
        Download now
      </a>
    </div>
  );
}
