import { CITIES } from '../cities.js'
import { CITY_CFG } from '../config.js'
import { simState, emitSimEvent } from '../state.js'
import { useMapState, patchMapState } from '../mapStore.js'
import { clearPoiCache } from '../services/PoiService.js'

// Top-center city tabs — SOFT routing: in City View the same global 3D
// stream simply flies to the other metro (no reload, tiles restream on
// arrival). Only entering Site View for a non-booted city triggers a
// reload, because the localized 3D scene is built from boot config.
export default function CitySwitcher() {
  const ms = useMapState()

  const pick = (id) => {
    if (id === ms.cityId) return
    try {
      localStorage.setItem('ameya.activeCity', id)
    } catch { /* session-only */ }
    clearPoiCache()
    patchMapState({ cityId: id, hotspot: null })
    if (simState.viewMode === 'micro' && CITY_CFG.id !== id) {
      window.location.reload() // rebuild the localized site scene for the new city
      return
    }
    const c = CITIES[id]
    emitSimEvent('flyToLocation', {
      longitude: c.macroView.longitude,
      latitude: c.macroView.latitude,
      zoom: c.macroView.zoom,
    })
  }

  return (
    <div className="city-tabs">
      {Object.values(CITIES).map((c) => (
        <button key={c.id} className={ms.cityId === c.id ? 'on' : ''} onClick={() => pick(c.id)}>
          {c.city.toUpperCase()} · {c.placeName.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
