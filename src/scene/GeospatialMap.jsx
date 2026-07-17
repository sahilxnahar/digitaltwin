import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { FlyToInterpolator, PathLayer, ScatterplotLayer, TextLayer, GeoJsonLayer, Tile3DLayer, TripsLayer } from 'deck.gl'
import { Map as MapLibreMap } from 'react-map-gl/maplibre'
import { Map as MapboxMap } from 'react-map-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CITY_CFG, PLACE_LAT, PLACE_LNG, PLACE_NAME } from '../config.js'
import { onSimEvent, emitSimEvent } from '../state.js'
import { fetchIsochrones } from '../services/LocationIntelAPI.js'

// ─── Google Maps Photorealistic 3D Tiles ───
// Requires "Map Tiles API" enabled on the key. While no key is present the
// map falls back to Mapbox (if token) or free Carto — the scene never breaks.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'PASTE_GOOGLE_MAPS_API_KEY_HERE'
const HAS_GOOGLE_KEY = !!GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.startsWith('PASTE_')
const GOOGLE_3D_TILES_URL = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`

// ─── Mapbox premium dark basemap (optional) ───
// Basemap priority: Google 3D Tiles → Mapbox Dark → Carto Dark Matter
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_KEY || ''
const HAS_MAPBOX_KEY = MAPBOX_KEY.startsWith('pk.')
const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11'

// Free, no-key Carto "Dark Matter" vector basemap served via MapLibre (fallback)
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// High-altitude macro framing for the active city (see src/cities.js)
const INITIAL_VIEW_STATE = {
  ...CITY_CFG.macroView,
  minZoom: 8.5,
  maxZoom: 16.5,
}

// Zooming past this level while centered over the Ameya Heights Chennai
// site hands off to the high-fidelity three.js micro sim
const MICRO_TRIGGER = { zoom: 15, dLat: 0.02, dLng: 0.03 }

// Simplified stylized arterial centerlines for the active city
const ARTERIALS = CITY_CFG.arterials

// Synthetic timestamps proportional to path length → looping animated trips
const LOOP = 600
const TRIPS = ARTERIALS.map((a) => {
  let cum = 0
  const ts = a.path.map((p, i) => {
    if (i > 0) cum += Math.hypot(p[0] - a.path[i - 1][0], p[1] - a.path[i - 1][1])
    return cum
  })
  const total = ts[ts.length - 1] || 1
  return { ...a, ts: ts.map((t) => (t / total) * LOOP) }
})

export default function GeospatialMap({ onEnterMicro, presenting = false }) {
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE)
  const [time, setTime] = useState(0)
  const lastView = useRef(INITIAL_VIEW_STATE) // latest camera pose (uncontrolled)
  const [isoData, setIsoData] = useState(null)
  const [showIso, setShowIso] = useState(false)

  // HUD "Travel Time" toggle → ORS 10/20/30-min drive isochrones
  useEffect(
    () =>
      onSimEvent((type) => {
        if (type !== 'toggleIsochrones') return
        setShowIso((prev) => {
          const next = !prev
          if (next && !isoData) {
            fetchIsochrones()
              .then(setIsoData)
              .catch((e) => console.warn('[TravelTime] isochrones unavailable —', e && e.message))
          }
          return next
        })
      }),
    [isoData]
  )

  useEffect(() => {
    let raf
    const loop = () => {
      setTime((t) => (t + 1.4) % LOOP)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Presentation sequencer + on-screen navigation → smooth camera flights
  useEffect(
    () =>
      onSimEvent((type) => {
        const fly = (target, ms, speed = 1.4) =>
          setInitialViewState({
            minZoom: 8.5,
            maxZoom: 16.5,
            ...target,
            transitionDuration: ms,
            transitionInterpolator: new FlyToInterpolator({ speed }),
            transitionEasing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
          })
        if (type === 'flyToSite') {
          fly({ longitude: PLACE_LNG, latitude: PLACE_LAT, zoom: 15.4, pitch: 50, bearing: 18 }, 3600)
        } else if (type === 'navZoomIn' || type === 'navZoomOut') {
          const v = lastView.current
          fly(
            {
              longitude: v.longitude,
              latitude: v.latitude,
              pitch: v.pitch,
              bearing: v.bearing,
              zoom: Math.min(Math.max(v.zoom + (type === 'navZoomIn' ? 1 : -1), 8.5), 16.5),
            },
            450,
            3
          )
        } else if (type === 'navReset') {
          fly(INITIAL_VIEW_STATE, 1200)
        }
      }),
    []
  )

  // Watch-only: fires for both user interaction AND programmatic flights,
  // so the presentation descent auto-triggers the LOD hand-off too
  const handleViewState = useCallback(
    ({ viewState: vs }) => {
      lastView.current = vs
      if (
        vs.zoom >= MICRO_TRIGGER.zoom &&
        Math.abs(vs.latitude - PLACE_LAT) < MICRO_TRIGGER.dLat &&
        Math.abs(vs.longitude - PLACE_LNG) < MICRO_TRIGGER.dLng
      ) {
        onEnterMicro()
      }
    },
    [onEnterMicro]
  )

  const layers = useMemo(
    () => [
      // photorealistic 3D Chennai buildings (only when a key is provided)
      HAS_GOOGLE_KEY &&
        new Tile3DLayer({
          id: 'google-3d-tiles',
          data: GOOGLE_3D_TILES_URL,
          onTilesetLoad: () => emitSimEvent('tilesLoaded'), // releases the loading screen
          onTileError: () => {}, // a failed tile must never break the scene
        }),
      // ORS drive-time isochrones (10/20/30 min) around the site
      showIso && isoData &&
        new GeoJsonLayer({
          id: 'iso',
          data: isoData,
          stroked: true,
          filled: true,
          getFillColor: (f) => {
            const v = f.properties && f.properties.value
            return v <= 600 ? [90, 214, 125, 45] : v <= 1200 ? [232, 194, 90, 38] : [232, 106, 90, 30]
          },
          getLineColor: (f) => {
            const v = f.properties && f.properties.value
            return v <= 600 ? [90, 214, 125, 200] : v <= 1200 ? [232, 194, 90, 190] : [232, 106, 90, 180]
          },
          lineWidthMinPixels: 1.5,
        }),
      // dim constant glow under the animated trips
      new PathLayer({
        id: 'arterial-glow',
        data: TRIPS,
        getPath: (d) => d.path,
        getColor: (d) => [d.color[0], d.color[1], d.color[2], 55],
        getWidth: 90,
        widthMinPixels: 5,
        capRounded: true,
        jointRounded: true,
      }),
      // animated emissive traffic pulses
      new TripsLayer({
        id: 'arterial-trips',
        data: TRIPS,
        getPath: (d) => d.path,
        getTimestamps: (d) => d.ts,
        getColor: (d) => d.color,
        currentTime: time,
        trailLength: 140,
        widthMinPixels: 3,
        capRounded: true,
        jointRounded: true,
        fadeTrail: true,
        opacity: 0.95,
      }),
      // pulsing beacon over the micro-sim site
      new ScatterplotLayer({
        id: 'site-pulse',
        data: [{ position: [PLACE_LNG, PLACE_LAT] }],
        getPosition: (d) => d.position,
        getFillColor: [90, 214, 125, 70],
        getLineColor: [90, 214, 125, 220],
        stroked: true,
        lineWidthMinPixels: 2,
        radiusUnits: 'meters',
        getRadius: 420 + 160 * Math.sin(time * 0.08),
        updateTriggers: { getRadius: time },
      }),
      new TextLayer({
        id: 'site-label',
        data: [{ position: [PLACE_LNG, PLACE_LAT], text: `${PLACE_NAME.toUpperCase()} ▸ ZOOM TO ENTER SITE` }],
        getPosition: (d) => d.position,
        getText: (d) => d.text,
        getSize: 13,
        getColor: [159, 232, 184, 255],
        getPixelOffset: [0, -28],
        fontFamily: 'Menlo, Consolas, monospace',
        background: true,
        getBackgroundColor: [8, 10, 14, 210],
        backgroundPadding: [6, 3],
      }),
    ],
    [time, isoData, showIso]
  )

  return (
    <DeckGL
      initialViewState={initialViewState}
      onViewStateChange={handleViewState}
      controller={!presenting} // lock manual camera input during the presentation
      layers={layers}
    >
      {/* basemap tiers (skipped entirely when Google 3D Tiles are active):
          Mapbox Dark when a token is set, otherwise free Carto Dark Matter */}
      {!HAS_GOOGLE_KEY &&
        (HAS_MAPBOX_KEY ? (
          <MapboxMap reuseMaps mapboxAccessToken={MAPBOX_KEY} mapStyle={MAPBOX_STYLE} />
        ) : (
          <MapLibreMap reuseMaps mapStyle={BASEMAP_STYLE} />
        ))}
    </DeckGL>
  )
}
