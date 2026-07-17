import { PLACE_LAT, PLACE_LNG } from '../config.js'

// Live environmental telemetry for the Chennai site. Layered free sources:
//   weather: Open-Meteo (no key) → OpenWeatherMap fallback (VITE_OWM_KEY)
//   AQI:     WAQI station feed (VITE_WAQI_TOKEN) → Open-Meteo air (no key)
// All payloads are ephemeral: fetched, parsed into a tiny plain object,
// rendered, discarded on the next poll.

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

async function weatherOpenMeteo() {
  const j = await getJson(WEATHER_URL)
  const c = j && j.current
  if (!c) throw new Error('open-meteo: no current block')
  const precipitation = num(c.precipitation)
  const rain = num(c.rain)
  const code = num(c.weather_code)
  return {
    temp: num(c.temperature_2m),
    precipitation,
    isRaining:
      (rain !== null && rain > 0) ||
      (precipitation !== null && precipitation > 0.05) ||
      (code !== null && RAIN_CODES.has(code)),
  }
}

async function weatherOwm() {
  const key = import.meta.env.VITE_OWM_KEY
  if (!key) throw new Error('no VITE_OWM_KEY')
  const j = await getJson(
    `https://api.openweathermap.org/data/2.5/weather?lat=${PLACE_LAT}&lon=${PLACE_LNG}&units=metric&appid=${key}`
  )
  const main = j && j.weather && j.weather[0] && j.weather[0].main
  return {
    temp: num(j && j.main && j.main.temp),
    precipitation: null,
    isRaining: !!(j && j.rain) || ['Rain', 'Drizzle', 'Thunderstorm'].includes(main),
  }
}

async function aqiWaqi() {
  const token = import.meta.env.VITE_WAQI_TOKEN
  if (!token) throw new Error('no VITE_WAQI_TOKEN')
  const j = await getJson(`https://api.waqi.info/feed/geo:${PLACE_LAT};${PLACE_LNG}/?token=${token}`)
  if (!j || j.status !== 'ok' || !Number.isFinite(j.data && j.data.aqi)) throw new Error('waqi: bad payload')
  const pm = j.data.iaqi && j.data.iaqi.pm25 && j.data.iaqi.pm25.v
  return { aqi: j.data.aqi, pm25: num(pm) }
}

async function aqiOpenMeteo() {
  const j = await getJson(AIR_URL)
  const c = j && j.current
  if (!c) throw new Error('open-meteo air: no current block')
  return { aqi: num(c.us_aqi), pm25: num(c.pm2_5) }
}

export async function fetchEnvironment() {
  const out = { temp: null, aqi: null, pm25: null, precipitation: null, isRaining: false }
  let got = false
  try {
    Object.assign(out, await weatherOpenMeteo())
    got = true
  } catch {
    try {
      Object.assign(out, await weatherOwm())
      got = true
    } catch { /* keep nulls */ }
  }
  try {
    Object.assign(out, await aqiWaqi())
    got = true
  } catch {
    try {
      Object.assign(out, await aqiOpenMeteo())
      got = true
    } catch { /* keep nulls */ }
  }
  if (!got) throw new Error('environment fetch failed')
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
