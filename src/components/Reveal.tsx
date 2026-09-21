import { motion, useInView, useMotionValue, useReducedMotion, animate } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const [text, setText] = useState((0).toFixed(decimals))

  useEffect(() => {
    if (!inView) return
    if (reduce) return setText(value.toFixed(decimals))
    const controls = animate(mv, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setText(v.toFixed(decimals)) })
    return () => controls.stop()
  }, [inView, value, decimals, mv, reduce])

  return <span ref={ref} className="tabular-nums">{text}</span>
}

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <Reveal className="mb-14 max-w-2xl">
      <p className="eyebrow mb-5 flex items-center gap-3"><span className="h-px w-8 bg-holo" />{eyebrow}</p>
      <h2 className="text-[clamp(2rem,4.5vw,3.6rem)] font-light uppercase leading-[1.02] tracking-tight">{title}</h2>
      {children && <p className="mt-5 max-w-lg leading-relaxed text-white/55">{children}</p>}
    </Reveal>
  )
}
