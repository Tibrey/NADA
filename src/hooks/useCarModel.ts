import { useGLTF } from '@react-three/drei'
import { MODEL_URL } from '@/data/car'

/** Loads (and caches) the supplied W201 GLB. Suspends until ready. */
export function useCarModel() {
  return useGLTF(MODEL_URL)
}

export const preloadCarModel = () => useGLTF.preload(MODEL_URL)
