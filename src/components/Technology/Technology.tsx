import { motion } from 'motion/react'
import { Cpu, Thermometer, Wind, Zap, type LucideIcon } from 'lucide-react'
import { technology } from '@/data/car'
import { Reveal, SectionHead } from '@/components/Reveal'

const icons: Record<string, LucideIcon> = { Wind, Zap, Thermometer, Cpu }

export function Technology() {
  return (
    <section id="technology" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead eyebrow="Technology" title={<>Systems, made<br />visible.</>}>
        The projection exposes what sits beneath the surface — the same model, read as engineering data.
      </SectionHead>
      <div className="grid gap-4 md:grid-cols-2">
        {technology.map((t, i) => {
          const Icon = icons[t.icon]
          return (
            <Reveal key={t.title} delay={(i % 2) * 0.08}>
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="glass group relative flex h-full gap-6 overflow-hidden rounded-2xl p-8 hover:border-holo/40"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(63,216,255,0.10),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-holo/30 text-holo">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div className="relative">
                  <h3 className="text-sm font-medium uppercase tracking-[0.18em]">{t.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{t.body}</p>
                </div>
              </motion.article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
