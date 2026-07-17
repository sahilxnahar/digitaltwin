import { useEffect } from 'react'
import { simState, subscribeEnvironment, startEnvironmentPolling } from '../state.js'

// ─── Bengaluru solar model: real local (IST) time → sun position ───
const SUNRISE = 6.1 // ≈ 06:06 IST
const SUNSET = 18.6 // ≈ 18:36 IST
const MAX_ELEVATION = 68 // deg, near-equatorial noon
const SUN_DISTANCE = 380

function bengaluruHourNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return get('hour') + get('minute') / 60
}

export function bengaluruSun() {
  const t = bengaluruHourNow()
  const frac = (t - SUNRISE) / (SUNSET - SUNRISE) // 0 sunrise → 1 sunset
  const elevationDeg = Math.sin(Math.PI * Math.min(Math.max(frac, 0), 1)) * MAX_ELEVATION
  const isDaylight = frac > 0 && frac < 1
  const el = ((isDaylight ? Math.max(elevationDeg, 4) : 4) * Math.PI) / 180
  const az = ((95 + 170 * Math.min(Math.max(frac, 0), 1)) * Math.PI) / 180 // east → west arc
  return {
    elevationDeg: isDaylight ? elevationDeg : -10,
    isDaylight,
    position: [
      SUN_DISTANCE * Math.cos(el) * Math.sin(az),
      SUN_DISTANCE * Math.sin(el),
      SUN_DISTANCE * Math.cos(el) * Math.cos(az),
    ],
  }
}

// Non-visual controller: starts the 15-min Open-Meteo poll, keeps the sun
// synced to real Bengaluru time, and (unless the user has taken a manual
// override) drives day / night / rain automatically from live telemetry.
export default function EnvironmentController({ enabled, onModeChange, onSunChange }) {
  useEffect(() => {
    startEnvironmentPolling()
  }, [])

  useEffect(() => {
    const apply = () => {
      const sun = bengaluruSun()
      onSunChange(sun.position)
      if (enabled) {
        const auto = simState.environmentalData.isRaining ? 'rain' : sun.isDaylight ? 'day' : 'night'
        onModeChange(auto)
      }
    }
    apply()
    const unsub = subscribeEnvironment(apply)
    const id = setInterval(apply, 60000) // re-sync the sun arc every minute
    return () => {
      unsub()
      clearInterval(id)
    }
  }, [enabled, onModeChange, onSunChange])

  return null
}
