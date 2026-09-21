import { lazy, Suspense, useMemo } from 'react'
import { useDevicePerformance } from '@/hooks/useDevicePerformance'
import { useInView } from '@/hooks/useInView'
import { hasWebGL } from '@/lib/webgl'
import type { Hotspot, HotspotId } from '@/data/car'
import type { SceneVariant } from '@/three/CarScene'
import { VehiclePoster } from './VehiclePoster'

// keep three.js / r3f out of the initial UI bundle
const CarScene = lazy(() => import('@/three/CarScene').then((m) => ({ default: m.CarScene })))

interface Props {
  variant: SceneVariant
  className?: string
  focus?: Hotspot | null
  onSelectHotspot?: (id: HotspotId) => void
  viewShift?: number
  eventSource?: React.RefObject<HTMLElement | null>
  /** mount immediately instead of waiting for the viewport (hero) */
  eager?: boolean
}

/** Mounts the WebGL scene only while visible; falls back to a poster without WebGL. */
export function CarViewer({ variant, className = '', eager = false, ...rest }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>('150px')
  const perf = useDevicePerformance()
  const webgl = useMemo(hasWebGL, [])
  const show = eager || inView

  return (
    <div ref={ref} className={`relative overflow-hidden bg-ink ${className}`}>
      {!webgl ? (
        <VehiclePoster />
      ) : (
        show && (
          <Suspense fallback={null}>
            <CarScene variant={variant} perf={perf} {...rest} />
          </Suspense>
        )
      )}
    </div>
  )
}
