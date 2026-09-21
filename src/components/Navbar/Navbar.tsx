import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { navItems } from '@/data/car'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('overview')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const els = navItems.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="fixed inset-x-0 top-4 z-50 px-4"
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 backdrop-blur-xl transition-colors duration-500 md:px-6 ${
          scrolled ? 'border-white/10 bg-[#070c13]/80' : 'border-white/[0.06] bg-[#070c13]/30'
        }`}
      >
        <a href="#overview" className="focus-ring flex items-center gap-2.5 rounded-full">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-holo/50 font-mono text-[10px] text-holo">W</span>
          <span className="text-sm font-medium tracking-[0.2em]">W201<span className="text-holo"> LAB</span></span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? 'true' : undefined}
                className="focus-ring relative rounded-full px-4 py-1.5 text-[13px] text-white/60 transition-colors hover:text-white aria-[current=true]:text-white"
              >
                {active === n.id && (
                  <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: 'spring', stiffness: 400, damping: 36 }} />
                )}
                <span className="relative">{n.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="#design" className="focus-ring hidden rounded-full bg-holo px-5 py-2 text-[13px] font-medium text-[#04121a] transition hover:bg-holo-soft md:block">
            Explore
          </a>
          <button
            type="button"
            className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/10 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden"
          >
            {navItems.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="focus-ring block rounded-2xl px-4 py-3 text-base text-white/80 hover:bg-white/5">
                {n.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
