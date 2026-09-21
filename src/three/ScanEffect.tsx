import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { useHoloStore } from '@/store/holoStore'
import { hologramConfig, holoStates, type HoloState } from './hologramConfig'
import type { HologramUniforms } from './HologramMaterial'

interface Props {
  uniforms: HologramUniforms
  reducedMotion: boolean
  /** auto-cycle scan → reveal → idle */
  autoCycle?: boolean
}

/**
 * Drives every hologram uniform from the state machine inside the render loop
 * (no React re-renders). State store changes only when the phase actually changes.
 */
export function ScanEffect({ uniforms, reducedMotion, autoCycle = true }: Props) {
  const timer = useRef(0)
  const last = useRef<HoloState>('HOLOGRAM')
  const nonce = useRef(0)
  const progress = useRef(1.2)

  useEffect(() => {
    // first mount: play a scan if already in hologram mode
    const s = useHoloStore.getState()
    if (s.viewMode === 'hologram' && !reducedMotion && autoCycle) s.requestScan()
  }, [reducedMotion, autoCycle])

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.1)
    const store = useHoloStore.getState()
    const cfg = hologramConfig
    let cur = store.holoState

    if (store.scanNonce !== nonce.current) {
      nonce.current = store.scanNonce
      timer.current = 0
      progress.current = -0.05
    }
    if (cur !== last.current) {
      timer.current = 0
      if (cur === 'SCANNING' && last.current !== 'SCANNING') progress.current = -0.05
      last.current = cur
    }

    timer.current += dt
    if (cur !== 'NORMAL' && autoCycle && !reducedMotion) {
      if (cur === 'SCANNING') {
        progress.current += (dt * cfg.scanSpeed) / cfg.scanDuration * 1.1
        if (timer.current >= cfg.scanDuration) store.setHoloState('REVEAL')
      } else if (cur === 'REVEAL' && timer.current >= cfg.revealDuration) store.setHoloState('HOLOGRAM')
      else if (cur === 'HOLOGRAM' && timer.current >= cfg.idleDuration) store.requestScan()
      cur = store.holoState
    }
    if (cur !== 'SCANNING') progress.current = MathUtils.damp(progress.current, 1.2, 2, dt)

    const t = holoStates[cur]
    const k = cfg.damping
    const u = uniforms
    u.uTime.value = state.clock.elapsedTime
    // mix uses a slower, linear-ish approach so the dissolve sweep reads as a deliberate animation
    const m = u.uMix.value
    const dm = t.mix - m
    u.uMix.value = Math.abs(dm) < 0.002 ? t.mix : m + Math.sign(dm) * Math.min(Math.abs(dm), dt * 0.55 + Math.abs(dm) * dt * 0.8)
    u.uGlowIntensity.value = MathUtils.damp(u.uGlowIntensity.value, cfg.glowIntensity * t.glow, k, dt)
    u.uScanIntensity.value = MathUtils.damp(u.uScanIntensity.value, t.scan * cfg.scanIntensity * (reducedMotion ? 0.2 : 1), k, dt)
    u.uReveal.value = MathUtils.damp(u.uReveal.value, t.reveal, k, dt)
    u.uWire.value = MathUtils.damp(u.uWire.value, t.wire, k, dt)
    u.uDistortion.value = MathUtils.damp(u.uDistortion.value, t.distortion * cfg.distortion * (reducedMotion ? 0.15 : 1), k, dt)
    u.uScanProgress.value = progress.current
  })

  return null
}
