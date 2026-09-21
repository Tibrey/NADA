import { motion } from 'motion/react'
import { useHoloStore } from '@/store/holoStore'
import type { ViewMode } from '@/three/hologramConfig'

const options: { id: ViewMode; label: string }[] = [
  { id: 'hologram', label: 'Hologram' },
  { id: 'real', label: 'Real' },
]

export function ViewToggle({ id = 'view-toggle' }: { id?: string }) {
  const viewMode = useHoloStore((s) => s.viewMode)
  const holoState = useHoloStore((s) => s.holoState)
  const setViewMode = useHoloStore((s) => s.setViewMode)
  const requestScan = useHoloStore((s) => s.requestScan)

  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Vehicle render mode" className="glass relative flex rounded-full p-1">
        {options.map((o) => {
          const active = viewMode === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setViewMode(o.id)}
              className="focus-ring relative rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
              style={{ color: active ? '#04121a' : 'rgba(232,241,250,0.7)' }}
            >
              {active && (
                <motion.span
                  layoutId={`${id}-pill`}
                  className="absolute inset-0 rounded-full bg-holo"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={requestScan}
        disabled={viewMode === 'real'}
        className="focus-ring glass hidden rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 transition hover:text-white disabled:opacity-30 sm:block"
      >
        Rescan
      </button>
      <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mute md:flex" aria-live="polite">
        <span className={`h-1.5 w-1.5 rounded-full ${holoState === 'NORMAL' ? 'bg-white/40' : 'bg-holo shadow-[0_0_8px_var(--color-holo)]'}`} />
        {holoState}
      </span>
    </div>
  )
}
