import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import type { ChromaticAberrationEffect, BloomEffect } from 'postprocessing'
import type { QualityTier } from './hologramConfig'
import type { HologramUniforms } from './HologramMaterial'

interface Props {
  uniforms: HologramUniforms
  tier: QualityTier
  reducedMotion: boolean
}

/** Controlled bloom + restrained chromatic split; both scale with the hologram mix. */
export function HologramEffect({ uniforms, tier, reducedMotion }: Props) {
  const bloom = useRef<BloomEffect>(null)
  const chroma = useRef<ChromaticAberrationEffect>(null)
  const maxBloom = tier === 'high' ? 0.8 : tier === 'medium' ? 0.65 : 0.5

  useFrame((state) => {
    const mix = uniforms.uMix.value
    if (bloom.current) bloom.current.intensity = 0.06 + mix * maxBloom + uniforms.uReveal.value * 0.35
    if (chroma.current && tier !== 'low') {
      const t = state.clock.elapsedTime
      const jitter = reducedMotion ? 0 : Math.max(0, Math.sin(t * 1.7) * Math.sin(t * 5.3)) * 0.0009
      const a = mix * (0.00055 + jitter) * (0.6 + uniforms.uDistortion.value)
      chroma.current.offset.set(a, a * 0.6)
    }
  })

  return (
    <EffectComposer multisampling={tier === 'high' ? 4 : tier === 'medium' ? 2 : 0} enableNormalPass={false}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.5} radius={0.72} />
      <ChromaticAberration ref={chroma} offset={[0, 0]} radialModulation={false} modulationOffset={0} blendFunction={BlendFunction.NORMAL} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </EffectComposer>
  )
}
