import { PLACE_LAT, PLACE_LNG } from '../config.js'

// ─── Free location-intelligence sources ───
// · OpenStreetMap Overpass (NO KEY): live amenity counts around the site
// · OpenRouteService (VITE_ORS_KEY, free): 10/20/30-min drive-time isochrones
// All payloads ephemeral; every failure degrades silently.

// Public Overpass instances — tried in order (they rate-limit individually)
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
]

async function withTimeout(promiseFactory, ms) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    return await promiseFactory(ctrl.signal)
  } finally {
    clearTimeout(id)
  }
}

// Shared Overpass POST with public-instance failover
async function overpassQuery(q) {
  for (const url of OVERPASS_URLS) {
    try {
      return await withTimeout(
        (signal) =>
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(q),
            signal,
          }).then((r) => {
            if (!r.ok) throw new Error(`overpass http ${r.status}`)
            return r.json() // an HTML rate-limit page rejects here → next mirror
          }),
        15000
      )
    } catch {
      /* try the next public instance */
    }
  }
  throw new Error('all overpass instances unavailable')
}

function waysToGeoJson(json, propsFor) {
  const feats = []
  for (const el of json.elements || []) {
    if (!el.geometry || el.geometry.length < 3) continue
    feats.push({
      type: 'Feature',
      properties: propsFor(el.tags || {}),
      geometry: { type: 'Polygon', coordinates: [el.geometry.map((p) => [p.lon, p.lat])] },
    })
  }
  return { type: 'FeatureCollection', features: feats }
}

// REAL building footprints around the site (live OpenStreetMap data),
// extruded in the city view — heights from building:levels where mapped
export async function fetchOsmBuildings() {
  const q = `[out:json][timeout:25];(way["building"](around:600,${PLACE_LAT},${PLACE_LNG}););out geom 1200;`
  const gj = waysToGeoJson(await overpassQuery(q), (t) => {
    const levels = parseFloat(t['building:levels'])
    return {
      height: parseFloat(t.height) || (Number.isFinite(levels) ? levels * 3.2 : 6),
      name: t.name || null,
      kind: t.building || 'yes',
    }
  })
  if (!gj.features.length) throw new Error('no OSM buildings returned')
  return gj
}

// Open land parcels (greenfield/brownfield/vacant/parks) — boundary marking
export async function fetchOpenLand() {
  const q =
    `[out:json][timeout:25];(` +
    `way["landuse"~"^(greenfield|brownfield|construction|vacant|grass|meadow|recreation_ground|village_green)$"](around:900,${PLACE_LAT},${PLACE_LNG});` +
    `way["leisure"="park"](around:900,${PLACE_LAT},${PLACE_LNG});` +
    `);out geom 400;`
  const gj = waysToGeoJson(await overpassQuery(q), (t) => ({ kind: t.landuse || t.leisure || 'open' }))
  if (!gj.features.length) throw new Error('no open-land parcels returned')
  return gj
}

// Live OSM amenity snapshot within ~1.5 km of Ameya Heights
export async function fetchAmenitySnapshot() {
  const q = `[out:json][timeout:20];(
    node["amenity"~"^(school|college|hospital|clinic|pharmacy|restaurant|cafe|bank|atm)$"](around:1500,${PLACE_LAT},${PLACE_LNG});
    way["amenity"~"^(school|college|hospital|clinic|restaurant|cafe)$"](around:1500,${PLACE_LAT},${PLACE_LNG});
    node["railway"="station"](around:2500,${PLACE_LAT},${PLACE_LNG});
    node["highway"="bus_stop"](around:1000,${PLACE_LAT},${PLACE_LNG});
    way["leisure"="park"](around:1500,${PLACE_LAT},${PLACE_LNG});
  );out tags 800;`
  const json = await overpassQuery(q)
  const els = Array.isArray(json && json.elements) ? json.elements : []
  const counts = { transit: 0, dining: 0, education: 0, healthcare: 0, parks: 0, banking: 0 }
  for (const el of els) {
    const t = el.tags || {}
    const a = t.amenity
    if (a === 'school' || a === 'college') counts.education++
    else if (a === 'hospital' || a === 'clinic' || a === 'pharmacy') counts.healthcare++
    else if (a === 'restaurant' || a === 'cafe') counts.dining++
    else if (a === 'bank' || a === 'atm') counts.banking++
    else if (t.railway === 'station' || t.highway === 'bus_stop') counts.transit++
    else if (t.leisure === 'park') counts.parks++
  }
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  if (total === 0) throw new Error('overpass returned no amenities')
  return counts
}

// ORS drive-time isochrones (10 / 20 / 30 minutes) from the site
export async function fetchIsochrones() {
  const key = import.meta.env.VITE_ORS_KEY
  if (!key) throw new Error('missing VITE_ORS_KEY — sign up free at openrouteservice.org')
  const gj = await withTimeout(
    (signal) =>
      fetch('https://api.openrouteservice.org/v2/isochrones/driving-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: key },
        body: JSON.stringify({ locations: [[PLACE_LNG, PLACE_LAT]], range: [600, 1200, 1800] }),
        signal,
      }).then((r) => {
        if (!r.ok) throw new Error(`ors http ${r.status}`)
        return r.json()
      }),
    15000
  )
  if (!gj || !Array.isArray(gj.features) || gj.features.length === 0) throw new Error('ors: empty response')
  return gj
}
