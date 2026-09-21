import { engineering } from '@/data/car'
import { Reveal, SectionHead } from '@/components/Reveal'

export function Engineering() {
  return (
    <section id="engineering" className="mx-auto max-w-6xl px-6 py-24">
      <div className="hairline mb-24" />
      <SectionHead eyebrow="Engineering" title={<>Precision in<br />every system.</>} />
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {engineering.map((e, i) => (
          <Reveal key={e.id} delay={(i % 3) * 0.07} className="bg-ink">
            <article className="group relative h-full p-8 transition-colors duration-500 hover:bg-panel">
              <span className="font-mono text-[11px] text-mute">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-10 text-3xl font-light tracking-tight text-holo-soft">{e.metric}</p>
              <h3 className="mt-3 text-sm font-medium uppercase tracking-[0.16em]">{e.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{e.body}</p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-holo transition-all duration-700 group-hover:w-full" />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
