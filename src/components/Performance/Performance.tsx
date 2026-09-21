import { stats } from '@/data/car'
import { CountUp, Reveal, SectionHead } from '@/components/Reveal'

export function Performance() {
  return (
    <section id="performance" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHead eyebrow="Performance" title={<>Numbers that<br />define the drive.</>}>
        Sixteen valves, a Cosworth-developed head and a chassis built to use every one of them.
      </SectionHead>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="glass group relative h-full overflow-hidden rounded-2xl p-7 transition-colors duration-500 hover:border-holo/40">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-holo/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{s.label}</p>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="text-6xl font-light tracking-tight"><CountUp value={s.value} decimals={s.decimals} /></span>
                <span className="text-sm text-holo">{s.unit}</span>
              </p>
              <p className="mt-4 text-sm text-white/45">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
