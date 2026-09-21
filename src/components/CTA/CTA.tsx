import { ArrowUpRight } from 'lucide-react'
import { CarViewer } from '@/components/CarViewer/CarViewer'
import { Reveal } from '@/components/Reveal'

export function CTA() {
  return (
    <section className="relative isolate mt-16 overflow-hidden py-40">
      <div className="absolute inset-0 -z-10 opacity-45">
        <CarViewer variant="background" className="h-full w-full" />
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(4,7,11,0.35),#04070b_75%),linear-gradient(180deg,#04070b,transparent_30%,transparent_70%,#04070b)]" />
      <Reveal className="mx-auto max-w-4xl px-6 text-center">
        <p className="eyebrow mb-6">Next era</p>
        <h2 className="text-[clamp(2.4rem,6vw,5rem)] font-light uppercase leading-[1] tracking-tight">
          Engineered for the <span className="font-semibold text-holo-soft">next era.</span>
        </h2>
        <a href="#overview" className="focus-ring group mt-10 inline-flex items-center gap-2 rounded-full bg-holo px-8 py-4 text-[13px] font-medium uppercase tracking-[0.14em] text-[#04121a] transition hover:bg-holo-soft">
          Start a new scan <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </section>
  )
}
