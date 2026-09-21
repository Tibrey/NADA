import { useMemo } from 'react'
import * as THREE from 'three'
import { hologramConfig, type QualityTier } from './hologramConfig'
import type { HologramUniforms } from './HologramMaterial'

interface Props {
  uniforms: HologramUniforms
  tier: QualityTier
  reducedMotion: boolean
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uMix;
  uniform float uScanProgress;
  uniform float uScanIntensity;
  uniform vec2 uBounds;
  uniform float uSpeed;
  uniform float uPixel;
  attribute vec4 aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * uSpeed;
    p.y += mod(aSeed.x * 6.0 + t * (0.05 + aSeed.y * 0.12), 2.6) - 0.2;
    p.x += sin(t * 0.6 + aSeed.z * 6.28) * 0.12;
    p.z += cos(t * 0.5 + aSeed.w * 6.28) * 0.12;
    float scanY = uBounds.x + (uBounds.y - uBounds.x) * uScanProgress;
    float near = exp(-abs(p.y - scanY) * 3.5) * uScanIntensity;
    float life = 0.5 + 0.5 * sin(t * 0.9 + aSeed.w * 12.0);
    vAlpha = (0.18 + near * 0.9) * life * smoothstep(0.0, 0.15, uMix) * smoothstep(2.4, 1.4, p.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (0.9 + aSeed.y * 1.2 + near * 2.2) * uPixel / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`
const fragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor * 1.6, a);
    #include <colorspace_fragment>
  }
`

export function HologramParticles({ uniforms, tier, reducedMotion }: Props) {
  const count = hologramConfig.particleCount[tier]
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      // ring-biased cloud around the vehicle footprint
      const a = Math.random() * Math.PI * 2
      const r = 1.1 + Math.pow(Math.random(), 0.7) * 2.6
      pos[i * 3] = Math.cos(a) * r * 0.85
      pos[i * 3 + 1] = Math.random() * 1.6
      pos[i * 3 + 2] = Math.sin(a) * r * 1.15
      seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uTime: uniforms.uTime,
        uMix: uniforms.uMix,
        uScanProgress: uniforms.uScanProgress,
        uScanIntensity: uniforms.uScanIntensity,
        uBounds: uniforms.uBounds,
        uColor: uniforms.uColor,
        uSpeed: { value: reducedMotion ? 0.25 : 1 },
        uPixel: { value: Math.min(window.devicePixelRatio, 2) * 16 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry: g, material: m }
  }, [count, uniforms, reducedMotion])

  return <points geometry={geometry} material={material} frustumCulled={false} dispose={null} />
}
