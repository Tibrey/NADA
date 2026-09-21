import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useProgress } from '@react-three/drei'
import { hasWebGL } from '@/lib/webgl'

/** Futuristic boot screen. Stays until the GLB has loaded and the first frame had time to render. */
export function Loader() {
  const { progress, loaded, total, active } = useProgress()
  const [done, setDone] = useState(!hasWebGL())
  const [online, setOnline] = useState(false)
  const finished = !active && loaded > 0 && loaded >= total && progress >= 100

  useEffect(() => {
    if (!finished) return
    setOnline(true)
    const t = setTimeout(() => setDone(true), 1300)
    return () => clearTimeout(t)
  }, [finished])

  // never trap the user if loading stalls
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 45000)
    return () => clearTimeout(t)
  }, [])

  const pct = Math.round(progress)
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          role="status"
          aria-live="polite"
        >
          <div className="w-[min(80vw,380px)]">
            <p className="eyebrow mb-5 flex justify-between">
              <span>{online ? 'Holographic system online' : 'Initializing vehicle system'}</span>
              <span className="tabular-nums text-white/60">{online ? '100' : pct.toString().padStart(3, '0')}%</span>
            </p>
            <div className="relative h-px w-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-holo shadow-[0_0_12px_var(--color-holo)]"
                animate={{ width: `${online ? 100 : pct}%` }}
                transition={{ ease: 'easeOut', duration: 0.4 }}
              />
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-mute">
              {online ? 'Scan sequence ready' : 'Streaming geometry · 185k polygons'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
