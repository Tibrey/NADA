import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'motion/react'
import { hotspots, type Hotspot, type HotspotId } from '@/data/car'
import type { DevicePerformance } from '@/hooks/useDevicePerformance'
import { CameraController, HERO_PRESET, type CameraPreset } from './CameraController'
import { CarModel } from './CarModel'
import { HologramEffect } from './HologramEffect'
import { HologramParticles } from './HologramParticles'
import { createHologramUniforms, type HologramUniforms } from './HologramMaterial'
import { BG_COLOR, Lighting } from './Lighting'
import { Platform } from './Platform'
import { ScanEffect } from './ScanEffect'
import type { QualityTier } from './hologramConfig'

export type SceneVariant = 'hero' | 'explorer' | 'background'

interface Props {
  variant: SceneVariant
  perf: DevicePerformance
  focus?: Hotspot | null
  onSelectHotspot?: (id: HotspotId) => void
  /** desktop hero pushes the car to the right, leaving room for typography */
  viewShift?: number
  eventSource?: React.RefObject<HTMLElement | null>
}

const EXPLORER_PRESET: CameraPreset = { position: [5.6, 2.6, 6.4], target: [0, 0.6, 0] }
const BACKGROUND_PRESET: CameraPreset = { position: [4.6, 1.5, 5.8], target: [0, 0.6, 0] }

function FocusDriver({ uniforms, focus }: { uniforms: HologramUniforms; focus: Hotspot | null }) {
  const target = useMemo(() => new THREE.Vector4(), [])
  useEffect(() => {
    if (focus) target.set(...focus.point, focus.radius)
    else target.w = 0
  }, [focus, target])
  useFrame((_, dt) => {
    const f = uniforms.uFocus.value
    const k = 1 - Math.exp(-dt * 4)
    if (target.w > 0) f.set(target.x, target.y, target.z, f.w + (target.w - f.w) * k)
    else f.w += (0 - f.w) * k
    if (f.w < 0.005 && target.w === 0) f.w = 0
  })
  return null
}

function Markers({ focus, onSelect }: { focus: Hotspot | null; onSelect?: (id: HotspotId) => void }) {
  return (
    <>
      {hotspots.map((h) => {
        const on = focus?.id === h.id
        return (
          <Html key={h.id} position={h.point} zIndexRange={on ? [40, 30] : [20, 0]} style={{ pointerEvents: 'none' }}>
            {/* zero-size anchor: its top-left corner is exactly the projected 3D point */}
            <div className="relative h-0 w-0">
              <button
                type="button"
                aria-label={`Focus ${h.label}`}
                aria-pressed={on}
                onClick={() => onSelect?.(h.id)}
                className="focus-ring group pointer-events-auto absolute left-0 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-holo/40 ${on ? '' : 'animate-ping'}`} />
                  <span className={`relative h-2 w-2 rounded-full border border-white/80 ${on ? 'bg-white' : 'bg-holo'}`} />
                </span>
                {!on && (
                  <span className="glass pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {h.label}
                  </span>
                )}
              </button>

              {on && (
                <div className="pointer-events-none absolute left-0 top-0 hidden md:block">
                  {/* leader line: from the dot (0,0) up-right to the card's left edge */}
                  <svg width="90" height="70" viewBox="0 0 90 70" className="absolute left-0 top-[-70px] overflow-visible">
                    <motion.polyline
                      points="0,70 40,24 90,24"
                      fill="none"
                      stroke="#8fe9ff"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    <motion.circle cx="90" cy="24" r="2.5" fill="#8fe9ff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
                  </svg>
                  {/* card's left-centre edge sits on the line end at (90, -46) */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="glass absolute left-[92px] top-[-46px] w-64 -translate-y-1/2 rounded-xl p-4 text-left"
                  >
                    <p className="eyebrow mb-2">{h.label}</p>
                    <p className="text-base font-light tracking-tight text-white">{h.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-white/60">{h.body}</p>
                  </motion.div>
                </div>
              )}
            </div>
          </Html>
        )
      })}
    </>
  )
}

function Scene({ variant, perf, focus, onSelectHotspot, viewShift, tier }: Props & { tier: QualityTier }) {
  const uniforms = useMemo(createHologramUniforms, [])
  const preset = variant === 'hero' ? HERO_PRESET : variant === 'explorer' ? EXPLORER_PRESET : BACKGROUND_PRESET
  const interactive = variant !== 'background'
  const showParticles = tier !== 'low' || variant === 'hero'
  return (
    <>
      <Lighting tier={tier} />
      <Platform uniforms={uniforms} />
      <Suspense fallback={null}>
        <CarModel uniforms={uniforms} wireframe={tier !== 'low'} parallax={variant === 'hero'} />
        {variant === 'explorer' && <Markers focus={focus ?? null} onSelect={onSelectHotspot} />}
      </Suspense>
      {showParticles && <HologramParticles uniforms={uniforms} tier={tier} reducedMotion={perf.reducedMotion} />}
      <ScanEffect uniforms={uniforms} reducedMotion={perf.reducedMotion} autoCycle />
      <FocusDriver uniforms={uniforms} focus={focus ?? null} />
      <CameraController
        preset={preset}
        focus={focus}
        viewShift={viewShift}
        interactive={interactive}
        autoRotate={!perf.reducedMotion && variant !== 'explorer'}
        isMobile={perf.isMobile}
      />
      <HologramEffect uniforms={uniforms} tier={tier} reducedMotion={perf.reducedMotion} />
    </>
  )
}

export function CarScene(props: Props) {
  const { perf, variant, eventSource } = props
  const [tier, setTier] = useState<QualityTier>(perf.tier)
  const [dpr, setDpr] = useState(perf.dpr[1])

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 32, near: 0.1, far: 60, position: HERO_PRESET.position }}
      gl={{ antialias: perf.tier === 'high', powerPreference: 'high-performance', alpha: false, stencil: false }}
      style={{ background: BG_COLOR }}
      eventSource={eventSource?.current ?? undefined}
      eventPrefix={eventSource ? 'client' : undefined}
      frameloop="always"
      aria-label={variant === 'background' ? undefined : 'Interactive 3D holographic vehicle'}
      role={variant === 'background' ? 'presentation' : 'img'}
    >
      <PerformanceMonitor
        bounds={() => [40, 60]}
        onDecline={() => {
          setDpr((d) => Math.max(1, d - 0.25))
          setTier((t) => (t === 'high' ? 'medium' : 'low'))
        }}
        flipflops={2}
      />
      <Scene {...props} tier={tier} />
    </Canvas>
  )
}
