import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hotspots, type HotspotId } from '@/data/car'
import { CarViewer } from '@/components/CarViewer/CarViewer'
import { ViewToggle } from '@/components/CarViewer/ViewToggle'
import { SectionHead } from '@/components/Reveal'

/** Vehicle explorer: hotspots focus the camera, highlight the area and open an info panel. */
export function Features() {
  const [activeId, setActiveId] = useState<HotspotId | null>(null)
  const active = hotspots.find((h) => h.id === activeId) ?? null
  const toggle = (id: HotspotId) => setActiveId((cur) => (cur === id ? null : id))

  return (
    <section id="design" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHead eyebrow="Vehicle explorer" title={<>Look closer.<br />Then closer still.</>}>
        Select a system to fly the camera to it and light up the surrounding structure.
      </SectionHead>

      <div className="glass overflow-hidden rounded-3xl">
        <div className="relative h-[62vh] min-h-[380px] lg:h-[620px]">
          <CarViewer variant="explorer" focus={active} onSelectHotspot={toggle} className="h-full w-full" />
          <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6"><ViewToggle id="explorer-toggle" /></div>

          <AnimatePresence mode="wait">
            {active && (
              <motion.aside
                key={active.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="glass absolute inset-x-4 bottom-4 z-10 rounded-2xl p-6 md:hidden"
                aria-live="polite"
              >
                <p className="eyebrow mb-3">{active.label}</p>
                <h3 className="text-xl font-light tracking-tight">{active.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{active.body}</p>
                <button type="button" onClick={() => setActiveId(null)} className="focus-ring mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-white">
                  Reset view
                </button>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        <ul className="flex gap-2 overflow-x-auto border-t border-line p-3" aria-label="Vehicle systems">
          {hotspots.map((h) => {
            const on = h.id === activeId
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => toggle(h.id)}
                  aria-pressed={on}
                  className={`focus-ring whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    on ? 'border-holo bg-holo/15 text-holo-soft' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
