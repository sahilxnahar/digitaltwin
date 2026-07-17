import { useEffect, useState } from 'react'
import { CITY, CITY_CFG, PLACE_LAT, PLACE_LNG, TRAFFIC_REFRESH_MS } from '../config.js'
import { fetchTrafficFlow } from '../services/TrafficAPI.js'

// Baked demo data — used whenever the key is missing or any fetch fails.
const DEMO_TRAFFIC = {
  currentSpeed: 19,
  freeFlowSpeed: 42,
  currentTravelTime: 212,
  freeFlowTravelTime: 96,
  confidence: 0.92,
  roadClosure: false,
}
const DEMO_AQI = { pm25: 48, station: 'Manali (demo)' }

function demoTraffic() {
  // gentle time-varying wobble so demo mode feels alive
  const w = Math.sin(Date.now() / 90000) * 0.18 + Math.sin(Date.now() / 23000) * 0.06
  const cur = Math.max(6, Math.round(DEMO_TRAFFIC.currentSpeed * (1 + w)))
  return {
    ...DEMO_TRAFFIC,
    currentSpeed: cur,
    currentTravelTime: Math.round((DEMO_TRAFFIC.freeFlowTravelTime * DEMO_TRAFFIC.freeFlowSpeed) / cur),
  }
}

const num = (v, fallback) => (Number.isFinite(v) ? v : fallback)

async function fetchWithTimeout(url, ms = 10000) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(id)
  }
}

// TomTom flow fetching now lives in src/services/TrafficAPI.js

async function fetchAqi(key) {
  const url =
    `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69` +
    `?api-key=${key}&format=json&limit=100&filters%5Bcity%5D=${encodeURIComponent(CITY_CFG.dataGovCity)}`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`aqi http ${res.status}`)
  const json = await res.json()
  const records = Array.isArray(json && json.records) ? json.records : []
  const rec = records.find(
    (r) => r && (r.pollutant_id === 'PM2.5' || r.pollutant_id === 'PM25') && Number.isFinite(parseFloat(r.avg_value))
  )
  if (!rec) throw new Error('no PM2.5 record')
  return { pm25: Math.round(parseFloat(rec.avg_value)), station: rec.station || CITY }
}

// All live payloads are ephemeral: fetched, parsed into a tiny plain object,
// rendered, and discarded on the next refresh. Nothing is persisted.
export function useLiveData(liveEnabled) {
  const [data, setData] = useState({
    source: 'demo',
    traffic: demoTraffic(),
    aqi: DEMO_AQI,
    aqiSource: 'demo',
    updatedAt: Date.now(),
  })

  useEffect(() => {
    let cancelled = false

    async function tick() {
      const key = import.meta.env.VITE_TOMTOM_KEY
      const aqiKey = import.meta.env.VITE_DATA_GOV_KEY
      if (!liveEnabled || !key) {
        if (!cancelled)
          setData((d) => ({ ...d, source: 'demo', traffic: demoTraffic(), aqi: DEMO_AQI, aqiSource: 'demo', updatedAt: Date.now() }))
        return
      }
      let traffic = null
      try {
        traffic = await fetchTrafficFlow()
      } catch {
        traffic = null // silent fallback — a network failure must never break the scene
      }
      let aqi = null
      if (aqiKey) {
        try {
          aqi = await fetchAqi(aqiKey)
        } catch {
          aqi = null
        }
      }
      if (cancelled) return
      if (traffic) {
        setData({
          source: 'live',
          traffic,
          aqi: aqi || DEMO_AQI,
          aqiSource: aqi ? 'live' : 'demo',
          updatedAt: Date.now(),
        })
      } else {
        setData({ source: 'demo', traffic: demoTraffic(), aqi: aqi || DEMO_AQI, aqiSource: aqi ? 'live' : 'demo', updatedAt: Date.now() })
      }
    }

    tick()
    const id = setInterval(tick, TRAFFIC_REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [liveEnabled])

  return data
}
