import * as THREE from 'three'
import { hologramConfig } from './hologramConfig'

/** Uniforms shared by the surface, wireframe and dissolve patches. One object per car instance. */
export interface HologramUniforms {
  [key: string]: THREE.IUniform
  uTime: THREE.IUniform<number>
  /** 0..1 real → hologram transition (vertical sweep) */
  uMix: THREE.IUniform<number>
  uScanProgress: THREE.IUniform<number>
  uScanIntensity: THREE.IUniform<number>
  uFresnelPower: THREE.IUniform<number>
  uOpacity: THREE.IUniform<number>
  uGlowIntensity: THREE.IUniform<number>
  uNoiseIntensity: THREE.IUniform<number>
  uDistortion: THREE.IUniform<number>
  uReveal: THREE.IUniform<number>
  uWire: THREE.IUniform<number>
  uColor: THREE.IUniform<THREE.Color>
  uWireColor: THREE.IUniform<THREE.Color>
  /** world-space min/max Y of the vehicle */
  uBounds: THREE.IUniform<THREE.Vector2>
  /** xyz = world point, w = radius (0 disables) */
  uFocus: THREE.IUniform<THREE.Vector4>
}

export function createHologramUniforms(): HologramUniforms {
  const c = hologramConfig
  return {
    uTime: { value: 0 },
    uMix: { value: 0 },
    uScanProgress: { value: 1.2 },
    uScanIntensity: { value: 0 },
    uFresnelPower: { value: c.fresnelPower },
    uOpacity: { value: c.opacity },
    uGlowIntensity: { value: c.glowIntensity },
    uNoiseIntensity: { value: c.noiseIntensity },
    uDistortion: { value: 0 },
    uReveal: { value: 0 },
    uWire: { value: 0 },
    uColor: { value: new THREE.Color(c.color) },
    uWireColor: { value: new THREE.Color(c.wireColor) },
    uBounds: { value: new THREE.Vector2(0, 1.3) },
    uFocus: { value: new THREE.Vector4(0, 0, 0, 0) },
  }
}

const common = /* glsl */ `
  uniform float uTime;
  uniform float uMix;
  uniform float uScanProgress;
  uniform float uScanIntensity;
  uniform float uDistortion;
  uniform vec2 uBounds;

  float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float hash31(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
`

/** Horizontal tear bands + micro jitter; identical for surface and wire so they stay registered. */
const displace = /* glsl */ `
  vec3 holoDisplace(vec3 wp) {
    float slice = floor(wp.y * 22.0);
    float tick = floor(uTime * 5.0);
    float gate = step(0.965, hash11(slice * 1.7 + tick * 3.1));
    float shift = (gate * 0.035 + sin(wp.y * 38.0 + uTime * 2.5) * 0.0018) * uDistortion;
    wp.x += shift;
    return wp;
  }
`

const vertex = /* glsl */ `
  ${common}
  ${displace}
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    wp.xyz = holoDisplace(wp.xyz);
    vN = normalize(mat3(modelMatrix) * normal);
    vW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragment = /* glsl */ `
  ${common}
  uniform vec3 uColor;
  uniform float uFresnelPower;
  uniform float uOpacity;
  uniform float uGlowIntensity;
  uniform float uNoiseIntensity;
  uniform float uReveal;
  uniform vec4 uFocus;
  varying vec3 vN;
  varying vec3 vW;

  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(cameraPosition - vW);
    float ndv = clamp(abs(dot(n, v)), 0.0, 1.0);
    float fres = pow(1.0 - ndv, uFresnelPower);

    // scanner
    float span = uBounds.y - uBounds.x;
    float scanY = uBounds.x + span * uScanProgress;
    float d = vW.y - scanY;
    float boundary = exp(-abs(d) * 110.0);
    float wake = d < 0.0 ? exp(d * 3.5) : 0.0;
    float scanned = 1.0 - smoothstep(-0.02, 0.06, d);

    // dissolve sweep for the REAL <-> HOLOGRAM transition
    float tEdge = uBounds.x - 0.12 + (span + 0.24) * uMix;
    float tv = 1.0 - smoothstep(-0.04, 0.04, vW.y - tEdge);
    float tGlow = exp(-abs(vW.y - tEdge) * 50.0) * step(0.001, uMix) * (1.0 - step(0.999, uMix));

    // surface structure
    float lines = pow(0.5 + 0.5 * sin(vW.y * 210.0 - uTime * 1.8), 8.0);
    float bands = smoothstep(0.92, 1.0, sin(vW.y * 5.5 - uTime * 0.7));
    vec3 g = abs(fract(vW * 16.0) - 0.5);
    float lattice = smoothstep(0.465, 0.5, max(g.x, g.z)) * (0.12 + uReveal * 0.55 + boundary * 0.3);
    float noise = hash31(floor(vW * 120.0) + floor(uTime * 14.0));

    float flick = 1.0 - 0.05 * sin(uTime * 41.0) - 0.05 * hash11(floor(uTime * 18.0));
    float dropout = 1.0 - 0.35 * step(0.985, hash11(floor(uTime * 7.0) + 11.0)) * uDistortion;

    float focus = 0.0;
    if (uFocus.w > 0.0) focus = smoothstep(uFocus.w, 0.0, distance(vW, uFocus.xyz));

    float energy = 0.10 + fres * uGlowIntensity * 1.9
      + lines * 0.10 + bands * 0.05 + lattice
      + boundary * uScanIntensity * 0.55 + wake * uScanIntensity * 0.08
      + tGlow * 0.5 + focus * 1.1;
    energy *= flick * dropout * (1.0 + uReveal * 0.55);
    energy += (noise - 0.5) * uNoiseIntensity * 0.12;

    vec3 rgb = mix(uColor, vec3(0.86, 1.0, 1.0), clamp(fres * 0.5 + boundary * 0.35 + tGlow * 0.5, 0.0, 1.0)) * energy;

    float alpha = (0.09 + fres * 0.72 + boundary * 0.14 + lines * 0.05 + tGlow * 0.14 + focus * 0.35)
      * mix(1.0, 0.35 + 0.65 * scanned, uScanIntensity) * (1.0 + uReveal * 0.5) * uOpacity * tv;
    alpha *= step(0.001, uMix);

    gl_FragColor = vec4(rgb, clamp(alpha, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`

const wireFragment = /* glsl */ `
  ${common}
  uniform vec3 uWireColor;
  uniform float uWire;
  uniform float uReveal;
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    float span = uBounds.y - uBounds.x;
    float d = vW.y - (uBounds.x + span * uScanProgress);
    float boundary = exp(-abs(d) * 60.0);
    float wake = d < 0.0 ? exp(d * 4.0) : 0.0;
    float scanned = 1.0 - smoothstep(-0.02, 0.06, d);
    float tEdge = uBounds.x - 0.12 + (span + 0.24) * uMix;
    float tv = 1.0 - smoothstep(-0.04, 0.04, vW.y - tEdge);
    float flick = 1.0 - 0.06 * sin(uTime * 37.0);
    float pulse = 0.85 + 0.15 * sin(vW.y * 8.0 - uTime * 1.3);
    float a = (0.16 + boundary * 0.9 + wake * 0.25 * uScanIntensity + uReveal * 0.35) * uWire * pulse * flick;
    a *= mix(1.0, 0.3 + 0.7 * scanned, uScanIntensity) * tv * step(0.001, uMix);
    gl_FragColor = vec4(uWireColor * (0.9 + boundary * 1.6), clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`

export function createHologramMaterial(uniforms: HologramUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })
}

export function createHologramLineMaterial(uniforms: HologramUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertex,
    fragmentShader: wireFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

/**
 * Patches a stock PBR material so it dissolves away along the same vertical sweep
 * that reveals the hologram. No transparency toggling → no shader recompiles at runtime.
 */
export function patchDissolve(material: THREE.Material, uniforms: HologramUniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDMix = uniforms.uMix
    shader.uniforms.uDBounds = uniforms.uBounds
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vDW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvDW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uDMix;\nuniform vec2 uDBounds;\nvarying vec3 vDW;'
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
        if (uDMix > 0.0005) {
          float dn = fract(sin(dot(floor(vDW.xz * 60.0), vec2(12.9898, 78.233))) * 43758.5453);
          float edge = uDBounds.x - 0.12 + (uDBounds.y - uDBounds.x + 0.24) * uDMix;
          if (vDW.y < edge + (dn - 0.5) * 0.02) discard;
        }`
      )
  }
  material.customProgramCacheKey = () => 'holo-dissolve'
  material.needsUpdate = true
}
