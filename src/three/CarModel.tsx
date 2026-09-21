import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useCarModel } from '@/hooks/useCarModel'
import { enhanceRealMaterial } from './realMaterials'
import { createHologramLineMaterial, createHologramMaterial, patchDissolve, type HologramUniforms } from './HologramMaterial'

interface Props {
  uniforms: HologramUniforms
  /** build the wireframe layer (skipped on low tiers) */
  wireframe: boolean
  /** subtle idle float + pointer parallax */
  float?: boolean
  parallax?: boolean
}

/**
 * Renders the supplied GLB twice from the SAME geometry: once with the original PBR materials
 * (patched to dissolve) and once with runtime hologram materials. Nothing is baked into the model.
 */
export function CarModel({ uniforms, wireframe, float = true, parallax = true }: Props) {
  const gltf = useCarModel()
  const group = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const realRef = useRef<THREE.Object3D>(null)
  const holoRef = useRef<THREE.Object3D>(null)

  const { real, holo, offset, height, disposables } = useMemo(() => {
    // per-instance clone: geometry/textures are shared, materials are cloned so several canvases can coexist
    const real = gltf.scene.clone(true)
    const matMap = new Map<THREE.Material, THREE.Material>()
    real.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const swap = (m: THREE.Material) => {
        let c = matMap.get(m)
        if (!c) matMap.set(m, (c = enhanceRealMaterial(m.clone())))
        return c
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material)
    })
    real.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(real)
    const center = box.getCenter(new THREE.Vector3())
    const offset = new THREE.Vector3(-center.x, -box.min.y, -center.z)

    const holoMat = createHologramMaterial(uniforms)
    const lineMat = createHologramLineMaterial(uniforms)
    const disposables: { dispose(): void }[] = [holoMat, lineMat, ...matMap.values()]

    const holo = real.clone(true)
    const seen = new Set<THREE.Material>()
    real.traverse((o) => {
      const m = (o as THREE.Mesh).material
      if (!(o as THREE.Mesh).isMesh || !m) return
      for (const mat of Array.isArray(m) ? m : [m]) {
        if (!seen.has(mat)) {
          seen.add(mat)
          patchDissolve(mat, uniforms)
        }
      }
    })
    holo.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = holoMat
      mesh.castShadow = mesh.receiveShadow = false
      mesh.renderOrder = 2
      mesh.frustumCulled = false
      if (wireframe) {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 38)
        disposables.push(edges)
        const lines = new THREE.LineSegments(edges, lineMat)
        lines.renderOrder = 3
        lines.frustumCulled = false
        mesh.add(lines)
      }
    })
    return { real, holo, offset, height: box.max.y - box.min.y, disposables }
  }, [gltf, uniforms, wireframe])

  useLayoutEffect(() => {
    uniforms.uBounds.value.set(0, height)
  }, [uniforms, height])

  useEffect(() => () => disposables.forEach((d) => d.dispose()), [disposables])

  const pointer = useRef(new THREE.Vector2())
  useFrame((state, dt) => {
    const mix = uniforms.uMix.value
    if (realRef.current) realRef.current.visible = mix < 0.999
    if (holoRef.current) holoRef.current.visible = mix > 0.001
    const g = group.current
    if (!g) return
    if (float) g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.025 * (0.4 + uniforms.uMix.value)
    if (parallax) {
      pointer.current.lerp(state.pointer, 1 - Math.exp(-dt * 3))
      g.rotation.y = pointer.current.x * 0.12
    }
    if (inner.current) inner.current.position.copy(offset)
  })

  return (
    <group ref={group}>
      <group ref={inner} position={offset}>
        <primitive ref={realRef} object={real} />
        <primitive ref={holoRef} object={holo} />
      </group>
    </group>
  )
}
