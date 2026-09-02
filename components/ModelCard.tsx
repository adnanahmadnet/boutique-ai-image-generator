import type { PipelineModel } from "@/data/models";

export default function ModelCard({ model }: { model: PipelineModel }) {
  const Icon = model.icon;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6 transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-default bg-accent-dim text-accent">
          <Icon size={20} stroke={1.75} />
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
            model.mode === "async"
              ? "border-accent/30 bg-accent-dim text-accent"
              : "border-success/30 bg-success-dim text-success"
          }`}
        >
          {model.mode === "async" ? "Async queue" : "Synchronous"}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="font-heading text-base font-semibold text-text">
          {model.name}
        </h3>
        <p className="text-[13px] leading-relaxed text-text-muted">
          {model.tagline}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-border pt-4">
        <div className="flex flex-col">
          <span className="font-mono text-lg text-text">{model.price}</span>
          <span className="text-[11px] text-text-dim">{model.priceNote}</span>
        </div>
        <span className="font-mono text-[12px] text-text-muted">
          {model.latency}
        </span>
      </div>
    </div>
  );
}
