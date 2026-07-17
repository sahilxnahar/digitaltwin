import { useEffect, useReducer } from 'react'
import { getActiveCityId } from './cities.js'

// ─── Map/filtration state store ───
// Same external-mutable pattern as simState: components subscribe via
// useMapState(); Deck.gl reads getMapState() during its render loop.
const state = {
  timeOfDay: 'day', // default bright — 'day' | 'night' (synced with Site View)
  basemap: 'default', // 'default' | 'satellite' | 'terrain'
  show3dTiles: true, // Google photorealistic tiles on/off
  overlays: { aqi: false, transit: false, cycling: false, fire: false, streetview: false, osmBuildings: false, openLand: false, terrain3d: false },
  siteMode: 'stylized', // Site View geometry: 'stylized' | 'real' (live OSM)
  cityId: getActiveCityId(), // ACTIVE city for the streaming macro view (soft-switched)
  poi: { openland: false, construction: false, dining: false, hotels: false, luxury: false, traffic: false },
  civic: { transit: true, transitSpeed: 1, flights: false, flood: false, floodLevel: 1.5 },
  filters: { floors: null, category: null }, // Site View real-estate filters
  hotspot: null, // active premium-corridor hotspot (from cities.js)
  _v: 0,
}

const listeners = new Set()

export function getMapState() {
  return state
}

export function patchMapState(patch) {
  Object.assign(state, patch)
  state._v++
  listeners.forEach((fn) => fn())
}

export function patchCivic(patch) {
  state.civic = { ...state.civic, ...patch }
  state._v++
  listeners.forEach((fn) => fn())
}

export function togglePoi(key) {
  state.poi = { ...state.poi, [key]: !state.poi[key] }
  state._v++
  listeners.forEach((fn) => fn())
}

export function toggleOverlay(key) {
  state.overlays = { ...state.overlays, [key]: !state.overlays[key] }
  state._v++
  listeners.forEach((fn) => fn())
}

export function subscribeMapState(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// React binding
export function useMapState() {
  const [, force] = useReducer((c) => c + 1, 0)
  useEffect(() => subscribeMapState(force), [])
  return state
}
