import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { car } from '@/data/car'
import { CarViewer } from '@/components/CarViewer/CarViewer'
import { ViewToggle } from '@/components/CarViewer/ViewToggle'
import { useDevicePerformance } from '@/hooks/useDevicePerformance'
import { useInView } from '@/hooks/useInView'
import { useHoloStore } from '@/store/holoStore'

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.5 + i * 0.12 },
})

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const perf = useDevicePerformance()
  const [ref, inView] = useInView<HTMLDivElement>('0px')
  const requestScan = useHoloStore((s) => s.requestScan)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // re-trigger the scan each time the hero enters view
  useEffect(() => {
    if (inView && !perf.reducedMotion) requestScan()
  }, [inView, perf.reducedMotion, requestScan])

  return (
    <section ref={section} id="overview" className="relative isolate min-h-screen select-none overflow-hidden">
      <div ref={ref} className="absolute inset-0 -z-10 hidden lg:block">
        {wide && <CarViewer variant="hero" eager viewShift={wide ? 0.13 : 0} eventSource={wide ? section : undefined} className="h-full w-full" />}
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#04070b_0%,rgba(4,7,11,0.85)_28%,transparent_58%),linear-gradient(0deg,#04070b_0%,transparent_22%)]" />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pb-16 pt-32 lg:pt-24">
        <div className="pointer-events-none max-w-xl">
          <motion.p {...reveal(0)} className="eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-holo" /> {car.eyebrow}
          </motion.p>
          <motion.h1 {...reveal(1)} className="text-[clamp(2.8rem,7vw,5.6rem)] font-light uppercase leading-[0.95] tracking-tight">
            The future
            <br />
            of <span className="font-semibold text-holo-soft">performance.</span>
          </motion.h1>
          <motion.p {...reveal(2)} className="mt-7 max-w-md text-base leading-relaxed text-white/60">
            {car.description}
          </motion.p>
          <motion.div {...reveal(3)} className="pointer-events-auto mt-10 flex flex-wrap gap-3">
            <a href="#design" className="focus-ring group inline-flex items-center gap-2 rounded-full bg-holo px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-[#04121a] transition hover:bg-holo-soft">
              Explore vehicle <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#specifications" className="focus-ring rounded-full border border-white/15 px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] text-white/80 transition hover:border-holo/60 hover:text-white">
              View specifications
            </a>
          </motion.div>
        </div>

        {/* mobile / tablet: viewer sits below the copy */}
        <div className="relative mt-10 h-[58vh] min-h-[320px] lg:hidden">
          {!wide && <CarViewer variant="hero" eager className="h-full w-full rounded-3xl border border-white/[0.06]" />}
        </div>

        <motion.div {...reveal(5)} className="mt-8 flex items-center justify-between gap-4 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mx-auto lg:mt-0 lg:max-w-6xl lg:px-6">
          <ViewToggle id="hero-toggle" />
          <a href="#performance" aria-label="Scroll to performance" className="focus-ring hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-mute md:flex">
            Scroll <ChevronDown size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
