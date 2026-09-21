export type HoloState = 'NORMAL' | 'HOLOGRAM' | 'SCANNING' | 'REVEAL'
export type ViewMode = 'real' | 'hologram'
export type QualityTier = 'high' | 'medium' | 'low'

/** Central tuning knobs for the hologram look. */
export const hologramConfig = {
  color: '#3fd8ff',
  wireColor: '#8fe9ff',
  opacity: 0.4,
  fresnelPower: 2.3,
  glowIntensity: 0.8,
  scanIntensity: 1,
  scanSpeed: 1,
  noiseIntensity: 0.4,
  distortion: 0.6,
  particleCount: { high: 900, medium: 480, low: 180 } as Record<QualityTier, number>,
  /** seconds spent in each phase of the automatic cycle */
  scanDuration: 5.5,
  revealDuration: 2.6,
  idleDuration: 7,
  /** exponential damping rate for state transitions (higher = snappier) */
  damping: 2.6,
}

export interface StateTarget {
  /** 0 = real materials, 1 = full hologram (drives the dissolve sweep) */
  mix: number
  glow: number
  scan: number
  reveal: number
  wire: number
  distortion: number
}

export const holoStates: Record<HoloState, StateTarget> = {
  NORMAL: { mix: 0, glow: 1, scan: 0, reveal: 0, wire: 0, distortion: 0 },
  HOLOGRAM: { mix: 1, glow: 1, scan: 0.2, reveal: 0, wire: 0.4, distortion: 0.7 },
  SCANNING: { mix: 1, glow: 1.25, scan: 1, reveal: 0, wire: 0.65, distortion: 1 },
  REVEAL: { mix: 1, glow: 1.6, scan: 0.45, reveal: 1, wire: 1, distortion: 0.55 },
}
