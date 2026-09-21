import { useState } from 'react'

/** Static stand-in shown when WebGL is unavailable. Drop a render at public/poster.jpg. */
export function VehiclePoster() {
  const [ok, setOk] = useState(true)
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#0b2230_0%,#04070b_70%)]">
      {ok && (
        <img
          src={`${import.meta.env.BASE_URL}poster.jpg`}
          alt="1982 W201 Cosworth rendered as a cyan holographic projection"
          className="h-full w-full object-contain"
          onError={() => setOk(false)}
        />
      )}
      {!ok && (
        <p className="eyebrow px-6 text-center text-mute">3D preview unavailable — WebGL is not supported on this device</p>
      )}
    </div>
  )
}
