import { useState } from 'react'
import { CITY_CFG } from '../config.js'
import { emitSimEvent } from '../state.js'
import { useMapState, patchMapState, toggleOverlay } from '../mapStore.js'

// Floating environmental & basemap control panel (City View).
// Pure React overlay — never touches the Deck.gl canvas directly.

const OVERLAYS = [
  { id: 'aqi', label: 'Air Quality' },
  { id: 'transit', label: 'Public Transport' },
  { id: 'cycling', label: 'Bicycling' },
  { id: 'fire', label: 'Wildfire Alerts' },
  { id: 'streetview', label: 'Street View · click map' },
]

export default function MapControls() {
  const [open, setOpen] = useState(false)
  const ms = useMapState()
  const hotspots = CITY_CFG.hotspots || []

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

          <div className="dim small label">top happening places</div>
          <div className="map-col">
            {hotspots.map((h) => (
              <button key={h.id} className={ms.hotspot && ms.hotspot.id === h.id ? 'on' : ''} onClick={() => pickHotspot(h)}>
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
