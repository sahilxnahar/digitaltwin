import { useMemo } from 'react'
import { Sky, Stars } from '@react-three/drei'
import {
  SUN_ELEVATION_DEG, SUN_AZIMUTH_DEG,
  FOG_DENSITY_DAY, FOG_DENSITY_NIGHT, FOG_DENSITY_RAIN,
} from '../config.js'

const CONFIGS = {
  day: {
    bg: '#dfae7b',
    fog: ['#e3b183', FOG_DENSITY_DAY],
    sun: { intensity: 2.6, color: '#ffc07a' },
    hemi: ['#ffd9a6', '#41506b', 0.55],
    ambient: 0.16,
  },
  night: {
    bg: '#070a14',
    fog: ['#0a0e18', FOG_DENSITY_NIGHT],
    sun: { intensity: 0.14, color: '#7787c9' },
    hemi: ['#1c2340', '#0b0e14', 0.4],
    ambient: 0.06,
  },
  rain: {
    bg: '#78848f',
    fog: ['#7d8893', FOG_DENSITY_RAIN],
    sun: { intensity: 0.55, color: '#bcc8d4' },
    hemi: ['#9aa7b5', '#39414b', 0.5],
    ambient: 0.18,
  },
}

export default function Lighting({ mode, sunPos: liveSun }) {
  const cfg = CONFIGS[mode] || CONFIGS.day

  const defaultSun = useMemo(() => {
    const el = (SUN_ELEVATION_DEG * Math.PI) / 180
    const az = (SUN_AZIMUTH_DEG * Math.PI) / 180
    const r = 380
    return [r * Math.cos(el) * Math.sin(az), r * Math.sin(el), r * Math.cos(el) * Math.cos(az)]
  }, [])
  // Live Chennai sun (real local time) when available; tuned constant otherwise
  const sunPos = liveSun || defaultSun

  return (
    <>
      <color key={`bg-${mode}`} attach="background" args={[cfg.bg]} />
      <fogExp2 key={`fog-${mode}`} attach="fog" args={cfg.fog} />
      <directionalLight
        position={sunPos}
        intensity={cfg.sun.intensity}
        color={cfg.sun.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-170}
        shadow-camera-right={170}
        shadow-camera-top={170}
        shadow-camera-bottom={-170}
        shadow-camera-far={950}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={cfg.hemi} />
      <ambientLight intensity={cfg.ambient} />
      {mode === 'day' && (
        <Sky
          sunPosition={sunPos}
          turbidity={6}
          rayleigh={2.5}
          mieCoefficient={0.02}
          mieDirectionalG={0.95}
          distance={4000}
        />
      )}
      {mode === 'night' && <Stars radius={330} depth={60} count={2600} factor={5} fade speed={0.5} />}
    </>
  )
}
