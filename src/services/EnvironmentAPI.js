import { PLACE_LAT, PLACE_LNG } from '../config.js'

// Live environmental telemetry for Basaveshwar Nagar via Open-Meteo —
// free, no API key required. All payloads are ephemeral: fetched, parsed
// into a tiny plain object, rendered, discarded on the next poll.

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${PLACE_LAT}&longitude=${PLACE_LNG}` +
  `&current=temperature_2m,precipitation,rain,weather_code&timezone=Asia%2FKolkata`

const AIR_URL =
  `https://air-quality-api.open-meteo.com/v1/air-quality` +
  `?latitude=${PLACE_LAT}&longitude=${PLACE_LNG}` +
  `&current=us_aqi,pm2_5&timezone=Asia%2FKolkata`

// WMO weather codes that mean precipitation is falling
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99])

const num = (v) => (Number.isFinite(v) ? v : null)

async function getJson(url, ms = 10000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`http ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(id)
  }
}

export async function fetchEnvironment() {
  const [weather, air] = await Promise.allSettled([getJson(WEATHER_URL), getJson(AIR_URL)])

  const out = { temp: null, aqi: null, pm25: null, precipitation: null, isRaining: false }

  if (weather.status === 'fulfilled') {
    const c = weather.value && weather.value.current
    if (c) {
      out.temp = num(c.temperature_2m)
      out.precipitation = num(c.precipitation)
      const rain = num(c.rain)
      const code = num(c.weather_code)
      out.isRaining =
        (rain !== null && rain > 0) ||
        (out.precipitation !== null && out.precipitation > 0.05) ||
        (code !== null && RAIN_CODES.has(code))
    }
  }
  if (air.status === 'fulfilled') {
    const c = air.value && air.value.current
    if (c) {
      out.aqi = num(c.us_aqi)
      out.pm25 = num(c.pm2_5)
    }
  }
  if (weather.status === 'rejected' && air.status === 'rejected') {
    throw new Error('environment fetch failed')
  }
  return out
}

// Standard US AQI bands → HUD color coding
export function aqiInfo(aqi) {
  if (!Number.isFinite(aqi)) return { label: 'n/a', color: '#7a838c' }
  if (aqi <= 50) return { label: 'Good', color: '#5ad67d' }
  if (aqi <= 100) return { label: 'Moderate', color: '#e8c25a' }
  if (aqi <= 150) return { label: 'Unhealthy (SG)', color: '#e89a5a' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#e86a5a' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#c95af0' }
  return { label: 'Hazardous', color: '#b03a3a' }
}
