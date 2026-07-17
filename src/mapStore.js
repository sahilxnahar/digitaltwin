import { useEffect, useReducer } from 'react'

// ─── Map/filtration state store ───
// Same external-mutable pattern as simState: components subscribe via
// useMapState(); Deck.gl reads getMapState() during its render loop.
const state = {
  timeOfDay: 'night', // macro basemap vision: 'day' | 'night'
  basemap: 'default', // 'default' | 'satellite' | 'terrain'
  show3dTiles: true, // Google photorealistic tiles on/off
  overlays: { aqi: false, transit: false, cycling: false, fire: false, streetview: false },
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
