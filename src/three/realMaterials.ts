import * as THREE from 'three'

/**
 * The GLB ships every material fully dielectric and rough (metalness 0, roughness 0.7–0.97),
 * which reads flat under studio light. These runtime overrides (applied to per-instance material
 * clones, never the model file) restore paint clearcoat, chrome, metal and glass behaviour.
 */
export function enhanceRealMaterial(m: THREE.Material): THREE.Material {
  const src = m as THREE.MeshStandardMaterial
  if (!src.isMeshStandardMaterial) return m
  const n = src.name
  const physical = new THREE.MeshPhysicalMaterial()
  physical.copy(src as THREE.MeshPhysicalMaterial)
  physical.name = n
  physical.envMapIntensity = 1.2

  if (/Car_Paint/.test(n)) {
    physical.metalness = 0.55
    physical.roughness = 0.32
    physical.clearcoat = 1
    physical.clearcoatRoughness = 0.04
    physical.envMapIntensity = 1.8
  } else if (/Chrome|Mirror/.test(n)) {
    physical.metalness = 1
    physical.roughness = 0.12
    physical.envMapIntensity = 2
  } else if (/Rim$|Rim_Bolts|Brake_Disc|Exhaust/.test(n)) {
    physical.metalness = 0.85
    physical.roughness = Math.min(physical.roughness, 0.35)
    physical.envMapIntensity = 1.6
  } else if (/Glass/.test(n) && !/Refl/.test(n)) {
    physical.transparent = true
    physical.opacity = /INT_Glass|Inner/.test(n) ? 0.35 : 0.28
    physical.roughness = 0.04
    physical.metalness = 0.1
    physical.depthWrite = false
    physical.envMapIntensity = 2.2
  } else if (/Plastic|Black|Rubber|Tyre/.test(n)) {
    physical.roughness = Math.min(physical.roughness, 0.6)
  } else if (/Leather|Wood/.test(n)) {
    physical.clearcoat = 0.3
    physical.clearcoatRoughness = 0.3
  }
  src.dispose()
  return physical
}
