import { useEffect, useState } from 'react'
import type { QualityTier } from '@/three/hologramConfig'

export interface DevicePerformance {
  tier: QualityTier
  isMobile: boolean
  reducedMotion: boolean
  dpr: [number, number]
}

const query = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

function detect(): DevicePerformance {
  const width = window.innerWidth
  const coarse = query('(pointer: coarse)')
  const isMobile = width < 768 || (coarse && width < 1024)
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  let tier: QualityTier = 'high'
  if (isMobile) tier = 'low'
  else if (width < 1024) tier = 'low'
  else if (cores <= 4 || memory <= 4 || width < 1440) tier = 'medium'
  const dpr: [number, number] = tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.5] : [1, 1.25]
  return { tier, isMobile, reducedMotion: query('(prefers-reduced-motion: reduce)'), dpr }
}

export function useDevicePerformance(): DevicePerformance {
  const [perf, setPerf] = useState<DevicePerformance>(detect)
  useEffect(() => {
    const update = () => setPerf((p) => {
      const n = detect()
      return n.tier === p.tier && n.isMobile === p.isMobile && n.reducedMotion === p.reducedMotion ? p : n
    })
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    window.addEventListener('resize', update)
    mq.addEventListener('change', update)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener('change', update)
    }
  }, [])
  return perf
}
