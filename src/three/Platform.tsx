import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Grid } from '@react-three/drei'
import type { HologramUniforms } from './HologramMaterial'

const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float glow = pow(max(0.0, 1.0 - r), 2.2) * 0.32;
    float ring = smoothstep(0.012, 0.0, abs(r - 0.62)) * 0.55 + smoothstep(0.008, 0.0, abs(r - 0.9)) * 0.3;
    float a = (glow + ring * (1.0 - smoothstep(0.7, 1.0, r))) * uStrength;
    gl_FragColor = vec4(uColor * 1.2, a);
    #include <colorspace_fragment>
  }
`

/** Circular projection platform: radial glow, fine rings, faint technical grid. */
export function Platform({ uniforms }: { uniforms: HologramUniforms }) {
  const ring = useRef<THREE.Mesh>(null)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: uniforms.uColor, uStrength: { value: 0.5 } },
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  )
  useFrame((_, dt) => {
    // platform brightens with the hologram
    const target = 0.35 + uniforms.uMix.value * 0.65 + uniforms.uReveal.value * 0.3
    const u = material.uniforms.uStrength
    u.value += (target - u.value) * (1 - Math.exp(-dt * 3))
    if (ring.current) ring.current.rotation.z += dt * 0.05
  })
  return (
    <group position={[0, 0.002, 0]}>
      <mesh ref={ring} rotation-x={-Math.PI / 2} material={material} renderOrder={1}>
        <planeGeometry args={[9, 9]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshBasicMaterial color="#05090f" />
      </mesh>
      <Grid
        position={[0, 0.001, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#0f3a4a"
        sectionSize={2.5}
        sectionThickness={0.9}
        sectionColor="#1b6f88"
        fadeDistance={11}
        fadeStrength={2.2}
        infiniteGrid
      />
    </group>
  )
}
