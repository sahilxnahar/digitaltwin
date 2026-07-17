import { PLACE_LAT, PLACE_LNG } from '../config.js'

// TomTom Traffic Flow API (free tier: 2,500 req/day) — live congestion for
// the Ameya Heights Chennai corridor. Payloads are ephemeral: fetched, parsed,
// rendered, discarded on the next refresh. Never persisted.

const num = (v, fallback = null) => (Number.isFinite(v) ? v : fallback)

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

// Returns normalized flow data incl. congestionRatio (currentSpeed / freeFlowSpeed):
//   ~1.0 free flow · ~0.5 heavy · <0.3 jammed
// Throws on any failure — callers fall back to demo data.
export async function fetchTrafficFlow() {
  const key = import.meta.env.VITE_TOMTOM_KEY
  if (!key) throw new Error('missing VITE_TOMTOM_KEY')

  const url =
    `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json` +
    `?key=${key}&point=${PLACE_LAT}%2C${PLACE_LNG}`
  const json = await getJson(url)
  const f = json && json.flowSegmentData
  if (!f) throw new Error('missing flowSegmentData')

  const currentSpeed = num(f.currentSpeed)
  const freeFlowSpeed = num(f.freeFlowSpeed)
  if (currentSpeed === null || freeFlowSpeed === null) throw new Error('malformed flow payload')

  return {
    currentSpeed,
    freeFlowSpeed,
    currentTravelTime: num(f.currentTravelTime, 0),
    freeFlowTravelTime: num(f.freeFlowTravelTime, 0),
    confidence: num(f.confidence, 0.8),
    roadClosure: !!f.roadClosure,
    congestionRatio: freeFlowSpeed > 0 ? currentSpeed / freeFlowSpeed : 1,
  }
}
