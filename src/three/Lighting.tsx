import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import type { QualityTier } from './hologramConfig'

export const BG_COLOR = '#04070b'

/** Procedural studio lighting (no network HDRIs) + atmosphere. */
export function Lighting({ tier }: { tier: QualityTier }) {
  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <fog attach="fog" args={[BG_COLOR, 9, 26]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} color="#cfe6ff" />
      <directionalLight position={[-5, 2, -4]} intensity={0.8} color="#3fd8ff" />
      <Environment resolution={tier === 'low' ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#dff1ff" />
        <Lightformer form="rect" intensity={2} position={[-6, 1.5, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} color="#9fdcff" />
        <Lightformer form="rect" intensity={1.6} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.4} position={[0, 2, -6]} scale={5} color="#3fd8ff" />
      </Environment>
      {tier !== 'low' && <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={12} blur={2.6} far={2.5} resolution={512} frames={1} color="#000814" />}
    </>
  )
}
