import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { FlyToInterpolator, PathLayer, ScatterplotLayer, TextLayer, Tile3DLayer, TripsLayer } from 'deck.gl'
import { Map as MapLibreMap } from 'react-map-gl/maplibre'
import { Map as MapboxMap } from 'react-map-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { PLACE_LAT, PLACE_LNG, PLACE_NAME } from '../config.js'
import { onSimEvent, emitSimEvent } from '../state.js'

// ─── Google Maps Photorealistic 3D Tiles ───
// Drop your key in here (or set VITE_GOOGLE_MAPS_KEY in .env). Requires the
// "Map Tiles API" to be enabled on the key in Google Cloud Console.
// While the placeholder is present, the map automatically falls back to the
// free, no-key Carto Dark Matter basemap — the scene never breaks.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'PASTE_GOOGLE_MAPS_API_KEY_HERE'
const HAS_GOOGLE_KEY = !!GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.startsWith('PASTE_')
const GOOGLE_3D_TILES_URL = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`

// ─── Mapbox premium dark basemap (optional) ───
// Sharper, fully customizable dark-mode cartography for production sites.
// Falls back to Carto if no token is provided. Basemap priority:
//   Google 3D Tiles → Mapbox Dark → Carto Dark Matter (no key needed)
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_KEY || ''
const HAS_MAPBOX_KEY = MAPBOX_KEY.startsWith('pk.')
const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11'

// Free, no-key Carto "Dark Matter" vector basemap served via MapLibre (fallback)
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

// High-altitude macro framing: Hebbal (N) down to Whitefield (SE)
const INITIAL_VIEW_STATE = {
  longitude: 77.62,
  latitude: 13.04,
  zoom: 10,
  pitch: 45,
  bearing: -12,
  minZoom: 8.5,
  maxZoom: 16.5,
}

// Zooming past this level while centered over Basaveshwar Nagar
// hands off to the high-fidelity three.js micro sim
const MICRO_TRIGGER = { zoom: 15, dLat: 0.02, dLng: 0.03 }

// Simplified static geometry of major Bengaluru arterials ([lng, lat]).
// Stylized centerlines — enough for a glowing city-scale flow picture.
const ARTERIALS = [
  { name: 'NH44 · Ballari Road (Hebbal corridor)', color: [255, 176, 64],
    path: [[77.594, 12.984], [77.585, 13.011], [77.591, 13.036], [77.597, 13.078], [77.596, 13.102]] },
  { name: 'Old Madras Road → Whitefield', color: [255, 176, 64],
    path: [[77.62, 12.99], [77.66, 13.0], [77.7, 13.005], [77.716, 12.992], [77.75, 12.98]] },
  { name: 'Outer Ring Road (east)', color: [90, 200, 255],
    path: [[77.591, 13.036], [77.62, 13.045], [77.64, 13.035], [77.67, 13.02], [77.7, 13.005], [77.7, 12.956], [77.68, 12.93], [77.66, 12.91], [77.622, 12.917]] },
  { name: 'Outer Ring Road (west)', color: [90, 200, 255],
    path: [[77.591, 13.036], [77.55, 13.023], [77.52, 13.013], [77.51, 12.96], [77.52, 12.925], [77.55, 12.918], [77.585, 12.912], [77.622, 12.917]] },
  { name: 'Tumkur Road (NH48)', color: [255, 176, 64],
    path: [[77.571, 12.999], [77.54, 13.02], [77.52, 13.03], [77.47, 13.06]] },
  { name: 'Mysuru Road', color: [255, 176, 64],
    path: [[77.575, 12.955], [77.54, 12.94], [77.52, 12.92], [77.48, 12.9]] },
  { name: 'Hosur Road → Electronic City', color: [255, 176, 64],
    path: [[77.6, 12.95], [77.622, 12.917], [77.64, 12.885], [77.66, 12.85]] },
  { name: 'Magadi Road (Basaveshwar Nagar)', color: [90, 214, 125],
    path: [[77.575, 12.975], [77.555, 12.976], [77.539, 12.975], [77.5, 12.97]] },
  { name: 'West of Chord Road', color: [90, 214, 125],
    path: [[77.555, 13.01], [77.545, 12.995], [77.54, 12.98], [77.545, 12.96]] },
  { name: 'Old Airport Road', color: [255, 176, 64],
    path: [[77.62, 12.96], [77.65, 12.958], [77.7, 12.956]] },
]

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
  // Uncontrolled view state (deck.gl's sanctioned pattern for programmatic
  // camera flights): updating this object with transition props triggers
  // a smooth FlyToInterpolator flight; user interaction otherwise rules.
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE)
  const [time, setTime] = useState(0)
  const lastView = useRef(INITIAL_VIEW_STATE) // latest camera pose (uncontrolled)

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

  useEffect(() => {
    let raf
    const loop = () => {
      setTime((t) => (t + 1.4) % LOOP)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

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
      // photorealistic 3D Bengaluru buildings (only when a key is provided)
      HAS_GOOGLE_KEY &&
        new Tile3DLayer({
          id: 'google-3d-tiles',
          data: GOOGLE_3D_TILES_URL,
          // Google requires visible attribution; deck.gl surfaces tile
          // credits via onTilesetLoad → tileset.credits in production apps
          onTilesetLoad: () => emitSimEvent('tilesLoaded'), // releases the loading screen
          onTileError: () => {}, // a failed tile must never break the scene
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
    [time]
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
