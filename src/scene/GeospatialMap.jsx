import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DeckGL from '@deck.gl/react'
import { FlyToInterpolator, PathLayer, ScatterplotLayer, TextLayer, GeoJsonLayer, Tile3DLayer, TileLayer, BitmapLayer, TripsLayer } from 'deck.gl'
import { Map as MapLibreMap } from 'react-map-gl/maplibre'
import { Map as MapboxMap } from 'react-map-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { CITY_CFG, PLACE_LAT, PLACE_LNG, PLACE_NAME } from '../config.js'
import { onSimEvent, emitSimEvent, simState } from '../state.js'
import { fetchIsochrones } from '../services/LocationIntelAPI.js'
import { getMapState, subscribeMapState } from '../mapStore.js'
import { fetchOsmBuildings, fetchOpenLand } from '../services/LocationIntelAPI.js'

// ─── Google Maps Photorealistic 3D Tiles ───
// Requires "Map Tiles API" enabled on the key. While no key is present the
// map falls back to Mapbox (if token) or free Carto — the scene never breaks.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'PASTE_GOOGLE_MAPS_API_KEY_HERE'
const HAS_GOOGLE_KEY = !!GOOGLE_MAPS_API_KEY && !GOOGLE_MAPS_API_KEY.startsWith('PASTE_')
const GOOGLE_3D_TILES_URL = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`

// ─── MapTiler dark basemap (optional, free tier needs NO card) ───
// Sign up: https://cloud.maptiler.com → key on the dashboard
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || ''
const HAS_MAPTILER_KEY = MAPTILER_KEY.length > 4
const MAPTILER_STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN || ''

// Resolve the vector basemap style for the current map options
function resolveBasemapStyle(ms) {
  if (HAS_MAPTILER_KEY) {
    const id =
      ms.basemap === 'satellite' ? 'hybrid'
        : ms.basemap === 'terrain' ? 'outdoor-v2'
          : ms.timeOfDay === 'day' ? 'streets-v2'
            : 'dataviz-dark'
    return `https://api.maptiler.com/maps/${id}/style.json?key=${MAPTILER_KEY}`
  }
  if (ms.basemap === 'default' && ms.timeOfDay === 'day')
    return 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  return BASEMAP_STYLE // keyless satellite/terrain unavailable → dark fallback
}

// ─── Contextual data layers: free raster tile feeds ───
const OVERLAY_TILES = {
  aqi: () => (WAQI_TOKEN ? `https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=${WAQI_TOKEN}` : null),
  transit: () => 'https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
  cycling: () => 'https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png',
  fire: () => 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_All/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
}
const OVERLAY_OPACITY = { aqi: 0.65, transit: 0.8, cycling: 0.85, fire: 0.9 }
const OVERLAY_MAXZOOM = { aqi: 11, transit: 18, cycling: 17, fire: 9 }

function rasterOverlay(id, url) {
  return new TileLayer({
    id: `overlay-${id}`,
    data: url,
    tileSize: 256,
    maxZoom: OVERLAY_MAXZOOM[id],
    opacity: OVERLAY_OPACITY[id],
    onTileError: () => {}, // a missing tile must never break the scene
    renderSubLayers: (props) => {
      const bb = props.tile.boundingBox
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [bb[0][0], bb[0][1], bb[1][0], bb[1][1]],
      })
    },
  })
}

// ─── Mapbox premium dark basemap (optional) ───
// Basemap priority: Google 3D Tiles → Mapbox Dark → MapTiler Dark → Carto Dark Matter
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
  const ms = getMapState() // fresh every frame (component re-renders on the time tick)
  const lastZoomRef = useRef(99) // 99 → must zoom OUT below the threshold before auto-trigger can arm
  const [osmBuildings, setOsmBuildings] = useState(null)
  const [openLand, setOpenLand] = useState(null)
  const fetching = useRef({})

  // lazily fetch real OSM data the first time each overlay is enabled
  useEffect(
    () =>
      subscribeMapState(() => {
        const s = getMapState()
        if (s.overlays.osmBuildings && !fetching.current.b) {
          fetching.current.b = true
          fetchOsmBuildings()
            .then(setOsmBuildings)
            .catch((e) => console.warn('[OSM buildings] unavailable —', e && e.message))
        }
        if (s.overlays.openLand && !fetching.current.l) {
          fetching.current.l = true
          fetchOpenLand()
            .then(setOpenLand)
            .catch((e) => console.warn('[Open land] unavailable —', e && e.message))
        }
      }),
    []
  )
  const tilesActive = HAS_GOOGLE_KEY && ms.show3dTiles && ms.basemap === 'default'
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

  // consume a search fly-to that was queued while this map was unmounted
  useEffect(() => {
    const p = simState.pendingFlyTo
    if (!p) return
    simState.pendingFlyTo = null
    setInitialViewState({
      minZoom: 8.5,
      maxZoom: 16.5,
      longitude: p.longitude,
      latitude: p.latitude,
      zoom: p.zoom || 15.2,
      pitch: 50,
      bearing: 0,
      transitionDuration: 2600,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.4 }),
      transitionEasing: (t) => 1 - Math.pow(1 - t, 3),
    })
  }, [])

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
      onSimEvent((type, payload) => {
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
        } else if (type === 'flyToLocation' && payload) {
          simState.pendingFlyTo = null
          fly({ longitude: payload.longitude, latitude: payload.latitude, zoom: payload.zoom || 15.2, pitch: 50, bearing: 0 }, 2400)
        }
      }),
    []
  )

  // Watch-only: fires for both user interaction AND programmatic flights,
  // so the presentation descent auto-triggers the LOD hand-off too
  const handleViewState = useCallback(
    ({ viewState: vs }) => {
      lastView.current = vs
      // EDGE-triggered hand-off: fires only when zoom CROSSES the threshold
      // upward, so returning from Site View never re-traps the camera and
      // zooming back out always works.
      const crossed = lastZoomRef.current < MICRO_TRIGGER.zoom && vs.zoom >= MICRO_TRIGGER.zoom
      lastZoomRef.current = vs.zoom
      if (
        crossed &&
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
      // photorealistic 3D buildings (hidden in satellite/terrain or when toggled off)
      tilesActive &&
        new Tile3DLayer({
          id: 'google-3d-tiles',
          data: GOOGLE_3D_TILES_URL,
          onTilesetLoad: () => emitSimEvent('tilesLoaded'), // releases the loading screen
          onTileError: () => {}, // a failed tile must never break the scene
        }),
      // contextual raster data layers (AQI / transit / cycling / wildfire)
      ...Object.keys(OVERLAY_TILES)
        .filter((k) => ms.overlays[k])
        .map((k) => {
          const url = OVERLAY_TILES[k]()
          return url ? rasterOverlay(k, url) : null
        }),
      // REAL OSM building footprints (live data), extruded in 3D
      ms.overlays.osmBuildings && osmBuildings &&
        new GeoJsonLayer({
          id: 'osm-buildings',
          data: osmBuildings,
          extruded: true,
          getElevation: (f) => f.properties.height,
          getFillColor: [186, 196, 208, 235],
          getLineColor: [30, 34, 40, 255],
          stroked: true,
          lineWidthMinPixels: 0.6,
        }),
      // open-land parcel boundaries (champagne outline, faint green fill)
      ms.overlays.openLand && openLand &&
        new GeoJsonLayer({
          id: 'open-land',
          data: openLand,
          stroked: true,
          filled: true,
          getFillColor: [90, 214, 125, 18],
          getLineColor: [230, 215, 178, 220],
          lineWidthMinPixels: 2.5,
        }),
      // premium corridor hotspot: champagne ring + luxury POI highlights
      ms.hotspot &&
        new ScatterplotLayer({
          id: 'hotspot-ring',
          data: [ms.hotspot],
          getPosition: (d) => [d.lng, d.lat],
          radiusUnits: 'meters',
          getRadius: (d) => d.radius || 800,
          stroked: true,
          filled: true,
          getFillColor: [230, 215, 178, 24],
          getLineColor: [230, 215, 178, 210],
          lineWidthMinPixels: 2,
        }),
      ms.hotspot &&
        new ScatterplotLayer({
          id: 'hotspot-pois',
          data: ms.hotspot.pois || [],
          getPosition: (d) => [d.lng, d.lat],
          radiusUnits: 'meters',
          getRadius: 40,
          getFillColor: [230, 215, 178, 235],
          stroked: true,
          getLineColor: [8, 10, 14, 220],
          lineWidthMinPixels: 1.5,
        }),
      ms.hotspot &&
        new TextLayer({
          id: 'hotspot-poi-names',
          data: ms.hotspot.pois || [],
          getPosition: (d) => [d.lng, d.lat],
          getText: (d) => d.name,
          getSize: 12.5,
          getColor: [230, 215, 178, 255],
          getPixelOffset: [0, -18],
          fontFamily: 'Georgia, serif',
          background: true,
          getBackgroundColor: [8, 10, 14, 195],
          backgroundPadding: [6, 3],
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
      // street/arterial name labels (visible over 3D tiles and basemaps)
      new TextLayer({
        id: 'arterial-names',
        data: TRIPS.map((a) => ({ position: a.path[Math.floor(a.path.length / 2)], text: a.name })),
        getPosition: (d) => d.position,
        getText: (d) => d.text,
        getSize: 11,
        getColor: [200, 208, 216, 230],
        fontFamily: 'Menlo, Consolas, monospace',
        background: true,
        getBackgroundColor: [8, 10, 14, 165],
        backgroundPadding: [4, 2],
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
    [time, isoData, showIso, osmBuildings, openLand]
  )

  const handleMapClick = (info) => {
    // Street View mode: clicking the map opens the Google panorama at that
    // point (coverage layers require a google.maps.Map instance, which our
    // detached-DOM architecture forbids — this is the clean equivalent)
    const s = getMapState()
    if (s.overlays.streetview && info && info.coordinate) {
      window.open(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${info.coordinate[1]},${info.coordinate[0]}`,
        '_blank'
      )
    }
  }

  return (
    <DeckGL
      initialViewState={initialViewState}
      onViewStateChange={handleViewState}
      onClick={handleMapClick}
      controller={!presenting} // lock manual camera input during the presentation
      layers={layers}
    >
      {/* basemap tiers (hidden while Google 3D Tiles are active):
          Mapbox (default only) → MapTiler day/night/satellite/terrain → Carto */}
      {!tilesActive &&
        (HAS_MAPBOX_KEY && ms.basemap === 'default' ? (
          <MapboxMap
            reuseMaps
            mapboxAccessToken={MAPBOX_KEY}
            mapStyle={ms.timeOfDay === 'day' ? 'mapbox://styles/mapbox/light-v11' : MAPBOX_STYLE}
          />
        ) : (
          <MapLibreMap reuseMaps mapStyle={resolveBasemapStyle(ms)} />
        ))}
    </DeckGL>
  )
}
