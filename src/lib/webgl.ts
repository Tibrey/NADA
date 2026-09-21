let cached: boolean | undefined

/** Probes once (a throwaway context is released immediately). */
export function hasWebGL(): boolean {
  if (cached !== undefined) return cached
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
    cached = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    cached = false
  }
  return cached
}
