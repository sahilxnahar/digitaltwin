import { useEffect, useRef, useState } from 'react'
import { CITY, PLACE_LAT, PLACE_LNG } from '../config.js'
import { simState, emitSimEvent } from '../state.js'

// Google-Maps-style search: type a street/place, pick a result, the city
// camera flies there. Geocoding: MapTiler (key, proximity-biased) with a
// keyless OSM Nominatim fallback. Pure React overlay — no map widgets.

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || ''

async function geocode(q, signal) {
  if (MAPTILER_KEY.length > 4) {
    const url =
      `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json` +
      `?key=${MAPTILER_KEY}&proximity=${PLACE_LNG},${PLACE_LAT}&limit=5`
    const j = await fetch(url, { signal }).then((r) => r.json())
    const feats = (j && j.features) || []
    return feats
      .filter((f) => Array.isArray(f.center))
      .map((f) => ({ name: f.place_name || f.text, lng: f.center[0], lat: f.center[1] }))
  }
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=5` +
    `&q=${encodeURIComponent(`${q}, ${CITY}, India`)}`
  const j = await fetch(url, { signal }).then((r) => r.json())
  return (Array.isArray(j) ? j : []).map((f) => ({
    name: f.display_name,
    lng: parseFloat(f.lon),
    lat: parseFloat(f.lat),
  }))
}

export default function SearchBar({ viewMode, setViewMode }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ctrlRef = useRef(null)

  // debounced autocomplete
  useEffect(() => {
    if (q.trim().length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    const id = setTimeout(async () => {
      if (ctrlRef.current) ctrlRef.current.abort()
      const ctrl = new AbortController()
      ctrlRef.current = ctrl
      setBusy(true)
      try {
        const r = await geocode(q.trim(), ctrl.signal)
        setResults(r)
        setOpen(true)
      } catch {
        /* aborted or offline — keep previous results */
      } finally {
        setBusy(false)
      }
    }, 350)
    return () => clearTimeout(id)
  }, [q])

  const go = (r) => {
    setOpen(false)
    setQ(r.name.split(',')[0])
    const target = { longitude: r.lng, latitude: r.lat, zoom: 15.2 }
    simState.pendingFlyTo = target // consumed if the macro map is (re)mounting
    if (viewMode !== 'macro') setViewMode('macro')
    emitSimEvent('flyToLocation', target)
  }

  return (
    <div className="search-bar">
      <input
        value={q}
        placeholder={`Search streets & places in ${CITY}…`}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0])
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {busy && <span className="search-busy pulse">…</span>}
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map((r, i) => (
            <button key={i} onClick={() => go(r)} title={r.name}>{r.name}</button>
          ))}
        </div>
      )}
    </div>
  )
}
