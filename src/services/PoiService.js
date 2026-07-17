import { loadGoogleMaps } from './googleMaps.js'

// ─── Viewport-restricted semantic POI engine ───
// ANTI-CRASH DESIGN: every request is bounded to the camera's current
// viewport (radius shrinks as you zoom in, hard-capped at 3 km), results
// are capped, responses are cached on a ~1 km grid, and duplicate
// in-flight requests are coalesced. Turning several filters on at once
// can therefore never fan out into city-wide queries.

export const POI_MIN_ZOOM = 12.5
const RESULT_CAP = 40
const CACHE_CAP = 60

const cache = new Map()
const inflight = new Map()
let placesSvc = null

export function radiusForZoom(zoom) {
  return Math.round(Math.min(3000, Math.max(600, 40000 / Math.pow(2, zoom - 9))))
}

export function clearPoiCache() {
  cache.clear()
}

async function places(center, radius, request) {
  const google = await loadGoogleMaps()
  if (!placesSvc) placesSvc = new google.maps.places.PlacesService(document.createElement('div'))
  return new Promise((resolve) => {
    placesSvc.nearbySearch({ location: center, radius, ...request }, (res, st) => {
      const S = google.maps.places.PlacesServiceStatus
      if ((st === S.OK || st === S.ZERO_RESULTS) && Array.isArray(res)) {
        resolve(
          res
            .slice(0, 20)
            .map((r) => ({
              name: r.name,
              lat: r.geometry && r.geometry.location && r.geometry.location.lat(),
              lng: r.geometry && r.geometry.location && r.geometry.location.lng(),
              rating: r.rating || null,
            }))
            .filter((p) => Number.isFinite(p.lat))
        )
      } else resolve([])
    })
  })
}

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

async function overpassPolys(center, radius, filter) {
  const q = `[out:json][timeout:20];(${filter}(around:${radius},${center.lat},${center.lng}););out geom 250;`
  for (const url of OVERPASS_URLS) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 14000)
      const json = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(q),
        signal: ctrl.signal,
      }).then((r) => {
        clearTimeout(t)
        if (!r.ok) throw new Error(`http ${r.status}`)
        return r.json()
      })
      const feats = []
      for (const el of json.elements || []) {
        if (!el.geometry || el.geometry.length < 3) continue
        feats.push({
          type: 'Feature',
          properties: { kind: (el.tags && (el.tags.landuse || el.tags.leisure)) || 'area' },
          geometry: { type: 'Polygon', coordinates: [el.geometry.map((p) => [p.lon, p.lat])] },
        })
      }
      return { type: 'FeatureCollection', features: feats }
    } catch {
      /* next mirror */
    }
  }
  return { type: 'FeatureCollection', features: [] }
}

export async function fetchPoiCategory(cat, center, zoom) {
  const radius = radiusForZoom(zoom)
  const key = `${cat}:${center.lat.toFixed(2)}:${center.lng.toFixed(2)}:${radius}`
  if (cache.has(key)) return cache.get(key)
  if (inflight.has(key)) return inflight.get(key)

  const run = (async () => {
    switch (cat) {
      case 'dining': {
        const [cafes, rest] = await Promise.all([
          places(center, radius, { type: 'cafe' }),
          places(center, radius, { type: 'restaurant' }),
        ])
        return { points: [...cafes, ...rest].slice(0, RESULT_CAP) }
      }
      case 'hotels':
        return { points: (await places(center, radius, { type: 'lodging' })).slice(0, RESULT_CAP) }
      case 'luxury': {
        const res = await places(center, radius, { type: 'lodging', keyword: '5 star luxury hotel' })
        return { points: res.filter((p) => !p.rating || p.rating >= 4.3).slice(0, RESULT_CAP) }
      }
      case 'openland':
        return {
          geojson: await overpassPolys(center, Math.min(radius, 1800),
            'way["landuse"~"^(greenfield|brownfield|vacant|grass|meadow|recreation_ground|village_green)$"]'),
        }
      case 'construction':
        return { geojson: await overpassPolys(center, Math.min(radius, 1800), 'way["landuse"="construction"]') }
      default:
        return null
    }
  })()
    .then((v) => {
      cache.set(key, v)
      inflight.delete(key)
      if (cache.size > CACHE_CAP) cache.delete(cache.keys().next().value)
      return v
    })
    .catch(() => {
      inflight.delete(key)
      return null
    })
  inflight.set(key, run)
  return run
}
