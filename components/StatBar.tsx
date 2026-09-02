import Container from "@/components/Container";
import { STATS } from "@/data/stats";

export default function StatBar() {
  return (
    <section className="border-y border-border bg-surface/60">
      <Container>
        <dl className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
              <dt className="order-2 text-[13px] text-text-muted">{stat.label}</dt>
              <dd className="order-1 font-mono text-2xl font-medium text-accent sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
