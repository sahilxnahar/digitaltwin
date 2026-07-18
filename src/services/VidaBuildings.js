import { PMTiles } from 'pmtiles'
import { parse } from '@loaders.gl/core'
import { MVTLoader } from '@loaders.gl/mvt'

// ─── VIDA Open Buildings streaming (Google + Microsoft + OSM footprints) ───
// PMTiles = single remote file read via HTTP range requests: the browser
// pulls only the byte ranges for tiles in the current viewport, straight
// from source.coop's public bucket. Nothing is downloaded or hosted by us.
// License: ODbL v1.0 — attribution shown in the Map Options panel.

// Candidate remote files, tried in order (env override wins). The newer
// OSM-combined dataset first, then the original merge.
const CANDIDATES = [
  import.meta.env.VITE_VIDA_PMTILES_URL,
  'https://data.source.coop/vida/google-microsoft-osm-open-buildings/pmtiles/by_country/country_iso=IND/IND.pmtiles',
  'https://data.source.coop/vida/google-microsoft-open-buildings/pmtiles/by_country/country_iso=IND/IND.pmtiles',
].filter(Boolean)

let pmPromise = null

async function getSource() {
  if (pmPromise) return pmPromise
  pmPromise = (async () => {
    for (const url of CANDIDATES) {
      try {
        const pm = new PMTiles(url)
        const header = await pm.getHeader() // validates the remote file
        console.info(`[VIDA] streaming footprints from ${url} (z${header.minZoom}–z${header.maxZoom})`)
        return { pm, header }
      } catch (e) {
        console.warn(`[VIDA] ${url} unavailable —`, e && e.message)
      }
    }
    throw new Error('no VIDA PMTiles source reachable')
  })()
  pmPromise.catch(() => {
    pmPromise = null // allow retry on next toggle
  })
  return pmPromise
}

// deck.gl TileLayer getTileData: fetch one MVT tile from the remote archive
export async function getVidaTile(tile) {
  try {
    const { pm } = await getSource()
    const { x, y, z } = tile.index
    const res = await pm.getZxy(z, x, y)
    if (!res || !res.data) return []
    const parsed = await parse(res.data, MVTLoader, {
      mvt: { shape: 'geojson', coordinates: 'wgs84', tileIndex: { x, y, z } },
      gis: { format: 'geojson' },
    })
    const feats = Array.isArray(parsed) ? parsed : (parsed && parsed.features) || []
    return feats
  } catch {
    return [] // a failed tile renders nothing — never breaks the scene
  }
}

// VIDA carries no height column — estimate from footprint area so the
// city reads believably (larger structures rise higher), with a stable
// per-feature jitter to avoid a uniform skyline.
export function estimateHeight(f) {
  const p = (f && f.properties) || {}
  const area = Number(p.area_in_meters) || 80
  const seed = Math.abs(Math.sin(area * 12.9898)) // deterministic jitter
  return Math.min(30, 3.2 + Math.sqrt(area) * 0.42 + seed * 3)
}
