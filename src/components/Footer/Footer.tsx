import { navItems } from '@/data/car'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <p className="text-sm tracking-[0.2em]">W201<span className="text-holo"> LAB</span></p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {navItems.map((n) => (
            <li key={n.id}><a href={`#${n.id}`} className="focus-ring text-[13px] text-white/50 transition hover:text-white">{n.label}</a></li>
          ))}
        </ul>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Independent showcase · not affiliated with the manufacturer</p>
      </div>
    </footer>
  )
}
