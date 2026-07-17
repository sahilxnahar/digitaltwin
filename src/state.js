import { fetchEnvironment } from './services/EnvironmentAPI.js'

// Shared mutable simulation state, read/written outside the React render cycle
export const simState = {
  time: 0,
  phase: 'NS', // which axis currently has green
  congestion: 0.55, // currentSpeed / freeFlowSpeed, clamped
  simSpeed: 1,
  scenario: 'normal', // 'normal' | 'vip' | 'construction'
  showDevelopment: false, // proposed semi-commercial building A/B toggle
  tourMode: false, // cinematic camera tour around the proposed site
  viewMode: 'macro', // 'macro' (city-scale deck.gl map) | 'micro' (three.js site sim)
  environmentalData: { temp: null, aqi: null, isRaining: false, lastUpdate: null },
  isPresentationActive: false, // scripted cinematic fly-through running
}

// ─── Lightweight sim event bus (presentation steps, HUD re-sync, fly-to) ───
const simEventListeners = new Set()
export function onSimEvent(fn) {
  simEventListeners.add(fn)
  return () => simEventListeners.delete(fn)
}
export function emitSimEvent(type) {
  simEventListeners.forEach((fn) => fn(type))
}

// ─── Presentation sequence actions ───
const presListeners = new Set()
export function subscribePresentation(fn) {
  presListeners.add(fn)
  return () => presListeners.delete(fn)
}

const presTimeouts = new Set()
// All sequencer timeouts register here so stopPresentation() can clear them
export function schedulePresentationStep(fn, delayMs) {
  const id = setTimeout(() => {
    presTimeouts.delete(id)
    fn()
  }, delayMs)
  presTimeouts.add(id)
  return id
}

export function startPresentation() {
  if (simState.isPresentationActive) return
  simState.isPresentationActive = true
  presListeners.forEach((fn) => fn(true))
}

export function stopPresentation() {
  presTimeouts.forEach(clearTimeout)
  presTimeouts.clear()
  if (!simState.isPresentationActive) return
  simState.isPresentationActive = false
  presListeners.forEach((fn) => fn(false))
}

export const SIGNAL_CYCLE = 22 // sim-seconds per full signal cycle

// ─── Live environment polling (Open-Meteo, every 15 minutes) ───
export const ENV_POLL_MS = 15 * 60 * 1000

const envListeners = new Set()
export function subscribeEnvironment(fn) {
  envListeners.add(fn)
  return () => envListeners.delete(fn)
}

let envPollId = null
export function startEnvironmentPolling() {
  if (envPollId !== null) return // idempotent — safe under StrictMode/HMR
  const tick = async () => {
    try {
      const env = await fetchEnvironment()
      simState.environmentalData = { ...simState.environmentalData, ...env, lastUpdate: Date.now() }
    } catch {
      // keep the previous reading — a network failure must never break the scene
    }
    envListeners.forEach((fn) => fn(simState.environmentalData))
  }
  tick()
  envPollId = setInterval(tick, ENV_POLL_MS)
}
