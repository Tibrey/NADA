import { specs } from '@/data/car'
import { Reveal, SectionHead } from '@/components/Reveal'

export function Specs() {
  return (
    <section id="specifications" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead eyebrow="Specifications" title={<>The data<br />sheet.</>} />
      <Reveal>
        <dl className="grid border-t border-line md:grid-cols-2 md:gap-x-16">
          {specs.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-line py-5 transition-colors hover:bg-white/[0.02]">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{s.label}</dt>
              <dd className="text-right text-lg font-light tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
