import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { FRONT_SIGN, type Hotspot } from '@/data/car'

export interface CameraPreset {
  position: [number, number, number]
  target: [number, number, number]
}

/** Cinematic three-quarter front view, slightly above centre. */
export const HERO_PRESET: CameraPreset = {
  position: [6.0, 2.6, 7.1 * FRONT_SIGN],
  target: [0, 0.55, 0],
}

interface Props {
  preset?: CameraPreset
  focus?: Hotspot | null
  /** fraction of viewport width to push the car sideways (desktop hero layout) */
  viewShift?: number
  autoRotate?: boolean
  interactive?: boolean
  isMobile?: boolean
}

const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

export function CameraController({ preset = HERO_PRESET, focus = null, viewShift = 0, autoRotate = true, interactive = true, isMobile = false }: Props) {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera, size, gl } = useThree()
  const goalPos = useRef(new THREE.Vector3(...preset.position))
  const goalTarget = useRef(new THREE.Vector3(...preset.target))
  const tween = useRef(0)
  const idle = useRef(0)

  // initial placement
  useEffect(() => {
    camera.position.set(...preset.position)
    controls.current?.target.set(...preset.target)
    controls.current?.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // allow vertical page scroll on touch devices; horizontal drags still orbit
  useEffect(() => {
    if (isMobile) gl.domElement.style.touchAction = 'pan-y'
  }, [gl, isMobile])

  // off-centre framing for the desktop hero (text left, car right)
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    if (viewShift !== 0) cam.setViewOffset(size.width, size.height, -size.width * viewShift, 0, size.width, size.height)
    else cam.clearViewOffset()
    return () => cam.clearViewOffset()
  }, [camera, size.width, size.height, viewShift])

  // focus / reset transitions
  useEffect(() => {
    if (focus) {
      goalTarget.current.set(...focus.point)
      goalPos.current.set(focus.point[0] + focus.cam[0], focus.point[1] + focus.cam[1], focus.point[2] + focus.cam[2])
    } else {
      goalTarget.current.set(...preset.target)
      goalPos.current.set(...preset.position)
    }
    tween.current = 2.4
  }, [focus, preset])

  useFrame((_, dt) => {
    dt = Math.min(dt, 0.1)
    const c = controls.current
    if (!c) return
    if (tween.current > 0) {
      tween.current -= dt
      const k = ease(dt, 3.2)
      camera.position.lerp(goalPos.current, k)
      c.target.lerp(goalTarget.current, k)
      idle.current = 0
    } else {
      idle.current += dt
    }
    // keep the camera above the floor and off the vehicle
    if (camera.position.y < 0.25) camera.position.y = 0.25
    c.autoRotate = autoRotate && !focus && idle.current > 2.5
    c.update()
  })

  const stop = () => {
    tween.current = 0
    idle.current = 0
  }

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={interactive}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={1.1}
      zoomSpeed={0.5}
      minDistance={2.6}
      maxDistance={11}
      minPolarAngle={Math.PI * 0.08}
      maxPolarAngle={Math.PI * 0.495}
      autoRotateSpeed={0.55}
      enableZoom={!isMobile}
      onStart={stop}
      onEnd={() => (idle.current = 0)}
    />
  )
}
