/** Single source of truth for vehicle content. Figures are for the 1983 190 E 2.3-16 (W201 Cosworth). */

export const MODEL_URL = `${import.meta.env.BASE_URL}models/w201.glb`

/** +1 when the nose of the (normalised) model points toward +Z, -1 otherwise. */
export const FRONT_SIGN = 1

export const car = {
  name: 'W201 Cosworth',
  tagline: 'The future of performance.',
  eyebrow: 'Engineered beyond limits',
  description:
    'A compact saloon rebuilt as a live engineering projection. Scan it, strip it back to structure, and explore the systems that made the 190 E 2.3-16 a benchmark.',
}

export const stats = [
  { label: '0–100 km/h', value: 7.5, decimals: 1, unit: 's', note: 'Standing start' },
  { label: 'Top speed', value: 230, decimals: 0, unit: 'km/h', note: 'Factory rated' },
  { label: 'Horsepower', value: 185, decimals: 0, unit: 'hp', note: '136 kW @ 6,200 rpm' },
  { label: 'Torque', value: 235, decimals: 0, unit: 'Nm', note: '@ 4,500 rpm' },
] as const

export const engineering = [
  { id: 'aero', title: 'Aerodynamic design', metric: 'Cd 0.33', body: 'Smooth underbody, flush glazing and a rear aerofoil tuned for stability at sustained high speed.' },
  { id: 'powertrain', title: 'Powertrain', metric: '2.3 L · 16 V', body: 'Cosworth-developed four-valve DOHC cylinder head on a robust inline-four, driving the rear axle through a 5-speed gearbox.' },
  { id: 'chassis', title: 'Chassis', metric: '1,240 kg', body: 'A compact, rigid monocoque with crumple zones defining the safety-first W201 architecture.' },
  { id: 'cooling', title: 'Cooling', metric: 'Oil + coolant', body: 'Front-mounted radiator and an engine oil cooler keep the high-revving head within thermal limits.' },
  { id: 'braking', title: 'Braking', metric: '4-wheel discs', body: 'Ventilated front discs with ABS on the sports variant for repeatable high-speed stops.' },
  { id: 'suspension', title: 'Suspension', metric: '5-link rear', body: 'Front struts with anti-dive geometry and the landmark multi-link rear axle that set the class benchmark.' },
] as const

export const technology = [
  { title: 'Active aerodynamics', icon: 'Wind', body: 'Airflow-managed surfaces reduce lift while keeping the body calm at speed.' },
  { title: 'Smart power management', icon: 'Zap', body: 'Fuel injection mapped for a broad, usable powerband across the rev range.' },
  { title: 'Advanced thermal control', icon: 'Thermometer', body: 'Coolant and oil circuits sized for sustained high-load operation.' },
  { title: 'Digital vehicle system', icon: 'Cpu', body: 'Every panel, component and mounting point captured in a single scan-ready model.' },
] as const

export type HotspotId = 'engine' | 'aero' | 'brakes' | 'wheels' | 'lighting' | 'cockpit'

export interface Hotspot {
  id: HotspotId
  label: string
  title: string
  body: string
  /** Position in normalised car space (X centred, Y up from ground, Z centred; nose = FRONT_SIGN). */
  point: [number, number, number]
  /** Camera position offset from the point, in car space. */
  cam: [number, number, number]
  radius: number
}

const f = FRONT_SIGN
export const hotspots: Hotspot[] = [
  { id: 'engine', label: 'Engine', title: '2.3-litre 16-valve', body: 'Cosworth cylinder head with four valves per cylinder — 185 hp from 2,299 cc.', point: [0, 0.86, 1.45 * f], cam: [2.6, 1.6, 2.4 * f], radius: 0.7 },
  { id: 'aero', label: 'Aerodynamics', title: 'Rear aerofoil', body: 'Deck-lid wing and low-drag body trim the Cd to 0.33 and steady the tail at speed.', point: [0, 0.98, -1.85 * f], cam: [2.4, 1.2, -2.6 * f], radius: 0.6 },
  { id: 'brakes', label: 'Brakes', title: 'Ventilated discs', body: 'Four-wheel disc brakes with ABS deliver confident, fade-resistant deceleration.', point: [0.84, 0.29, 1.47 * f], cam: [3.0, 0.45, 1.6 * f], radius: 0.45 },
  { id: 'wheels', label: 'Wheels', title: 'Cross-spoke alloys', body: 'Lightweight alloy wheels on wide, low-profile tyres sharpen response and grip.', point: [0.84, 0.29, -1.18 * f], cam: [3.0, 0.45, -1.6 * f], radius: 0.5 },
  { id: 'lighting', label: 'Lighting', title: 'Integrated headlamps', body: 'Wide, flush lamp units with a clean bonnet-to-bumper transition.', point: [0.6, 0.72, 2.15 * f], cam: [2.0, 0.7, 3.0 * f], radius: 0.4 },
  { id: 'cockpit', label: 'Cockpit', title: 'Driver-focused cabin', body: 'Upright, supportive seating and instruments angled toward the driver.', point: [0, 1.0, -0.3 * f], cam: [2.6, 1.5, 1.6 * f], radius: 0.7 },
]

export const specs = [
  { label: 'Engine', value: '2.3 L inline-four, 16-valve DOHC' },
  { label: 'Power', value: '185 hp (136 kW) @ 6,200 rpm' },
  { label: 'Torque', value: '235 Nm @ 4,500 rpm' },
  { label: 'Transmission', value: '5-speed manual' },
  { label: 'Acceleration', value: '0–100 km/h in 7.5 s' },
  { label: 'Top speed', value: '230 km/h' },
  { label: 'Weight', value: '1,240 kg' },
  { label: 'Drive type', value: 'Rear-wheel drive' },
] as const

export const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'technology', label: 'Technology' },
  { id: 'design', label: 'Design' },
  { id: 'specifications', label: 'Specifications' },
] as const
