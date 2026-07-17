import { useState } from 'react'
import { CITIES } from '../cities.js'
import { emitSimEvent } from '../state.js'
import { useMapState, patchMapState, toggleOverlay, togglePoi, patchCivic } from '../mapStore.js'
import { POI_MIN_ZOOM } from '../services/PoiService.js'

// Floating environmental & basemap control panel (City View).
// Pure React overlay — never touches the Deck.gl canvas directly.

const POI_FILTERS = [
  { id: 'openland', label: 'Open Lands / Empty Plots' },
  { id: 'construction', label: 'Construction Zones' },
  { id: 'dining', label: 'Cafés & Restaurants' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'luxury', label: '5-Star Hotels' },
  { id: 'traffic', label: 'Live Traffic · TomTom' },
]

const OVERLAYS = [
  { id: 'aqi', label: 'Air Quality' },
  { id: 'transit', label: 'Public Transport' },
  { id: 'cycling', label: 'Bicycling' },
  { id: 'fire', label: 'Wildfire Alerts' },
  { id: 'streetview', label: 'Street View · click map' },
  { id: 'osmBuildings', label: 'Real Buildings · OSM' },
  { id: 'openLand', label: 'Open Land Boundaries' },
  { id: 'terrain3d', label: 'Terrain 3D · SRTM + Sentinel-2' },
]

export default function MapControls() {
  const [open, setOpen] = useState(false)
  const ms = useMapState()
  const hotspots = (CITIES[ms.cityId] && CITIES[ms.cityId].hotspots) || []

  const pickHotspot = (h) => {
    const active = ms.hotspot && ms.hotspot.id === h.id
    patchMapState({ hotspot: active ? null : h })
    if (!active) emitSimEvent('flyToLocation', { longitude: h.lng, latitude: h.lat, zoom: h.zoom || 14.5 })
  }

  return (
    <div className="map-controls">
      <button className={open ? 'aerial-btn on' : 'aerial-btn'} onClick={() => setOpen(!open)}>
        🗺 MAP OPTIONS
      </button>
      {open && (
        <div className="panel map-panel">
          <div className="serif-title">MAP OPTIONS</div>

          <div className="dim small label">time of day</div>
          <div className="map-row">
            <button className={ms.timeOfDay === 'day' ? 'on' : ''} onClick={() => patchMapState({ timeOfDay: 'day' })}>Day</button>
            <button className={ms.timeOfDay === 'night' ? 'on' : ''} onClick={() => patchMapState({ timeOfDay: 'night' })}>Night</button>
          </div>

          <div className="dim small label">base map</div>
          <div className="map-row">
            {['default', 'satellite', 'terrain'].map((b) => (
              <button key={b} className={ms.basemap === b ? 'on' : ''} onClick={() => patchMapState({ basemap: b })}>
                {b === 'default' ? 'Default' : b === 'satellite' ? 'Satellite' : 'Terrain'}
              </button>
            ))}
            <button className={ms.show3dTiles ? 'on' : ''} onClick={() => patchMapState({ show3dTiles: !ms.show3dTiles })}>
              3D Bldgs
            </button>
          </div>
          {ms.basemap !== 'default' && (
            <div className="dim small">satellite / terrain views hide the 3D tiles automatically</div>
          )}

          <div className="dim small label">data layers</div>
          <div className="map-row wrap">
            {OVERLAYS.map((o) => (
              <button key={o.id} className={ms.overlays[o.id] ? 'on' : ''} onClick={() => toggleOverlay(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
          {ms.overlays.streetview && (
            <div className="dim small">Street View armed — click anywhere on the map to open the panorama</div>
          )}

          <div className="dim small label">civic simulation</div>
          <div className="map-row wrap">
            <button className={ms.civic.transit ? 'on' : ''} onClick={() => patchCivic({ transit: !ms.civic.transit })}>
              Transit Flow
            </button>
            {[1, 4, 10].map((s) => (
              <button
                key={s}
                className={ms.civic.transitSpeed === s ? 'on' : ''}
                onClick={() => patchCivic({ transitSpeed: s })}
              >
                {s}×
              </button>
            ))}
            <button className={ms.civic.flights ? 'on' : ''} onClick={() => patchCivic({ flights: !ms.civic.flights })}>
              ✈ Live Flights
            </button>
            <button className={ms.civic.flood ? 'on' : ''} onClick={() => patchCivic({ flood: !ms.civic.flood })}>
              Flood Risk
            </button>
          </div>
          {ms.civic.flood && (
            <div className="flood-slider">
              <span className="dim small">inundation {ms.civic.floodLevel.toFixed(2)} m</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.25"
                value={ms.civic.floodLevel}
                onChange={(e) => patchCivic({ floodLevel: parseFloat(e.target.value) })}
              />
            </div>
          )}
          {ms.civic.flights && (
            <div className="dim small">live aircraft via OpenSky Network (anonymous tier — updates ~15 s)</div>
          )}

          <div className="dim small label">property intelligence</div>
          <div className="map-row wrap">
            {POI_FILTERS.map((o) => (
              <button key={o.id} className={ms.poi[o.id] ? 'on' : ''} onClick={() => togglePoi(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="dim small">
            POIs load for the current viewport only (zoom ≥ {POI_MIN_ZOOM}) — pan or zoom to refresh
          </div>

          <div className="dim small label">top happening places</div>
          <div className="map-col">
            {hotspots.map((h) => (
              <button key={h.id} className={ms.hotspot && ms.hotspot.id === h.id ? 'on' : ''} onClick={() => pickHotspot(h)}>
                {h.name}
              </button>
            ))}
          </div>
          <div className="dim small" style={{ marginTop: 6 }}>
            data © OpenStreetMap contributors · Open Buildings (Google/Microsoft) ·
            Sentinel-2 cloudless © EOX · SRTM
          </div>
        </div>
      )}
    </div>
  )
}
