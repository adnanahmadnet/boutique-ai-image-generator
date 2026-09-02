import type { Feature } from "@/data/features";

export default function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-default bg-accent-dim text-accent">
        <Icon size={20} stroke={1.75} />
      </div>
      <h3 className="font-heading text-base font-semibold text-text">
        {feature.title}
      </h3>
      <p className="text-[13.5px] leading-relaxed text-text-muted">
        {feature.description}
      </p>
    </div>
  );
}
