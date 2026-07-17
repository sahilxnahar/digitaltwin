import { CITIES, getActiveCityId } from './cities.js'

// ═══ Active city (Chennai ⇄ Bengaluru via the top tab switcher) ═══
export const CITY_CFG = CITIES[getActiveCityId()]
export const CITY = CITY_CFG.city
export const PLACE_NAME = CITY_CFG.placeName
export const PLACE_LAT = CITY_CFG.lat
export const PLACE_LNG = CITY_CFG.lng
export const AERIAL_ADDRESS = CITY_CFG.aerialAddress

// ─── Look & feel tuning ───
export const BLOOM_INTENSITY_DAY = 0.35
export const BLOOM_INTENSITY_NIGHT = 0.95
export const BLOOM_INTENSITY_RAIN = 0.5
export const SUN_ELEVATION_DEG = 14 // golden hour
export const SUN_AZIMUTH_DEG = 245
export const FOG_DENSITY_DAY = 0.0016
export const FOG_DENSITY_NIGHT = 0.0022
export const FOG_DENSITY_RAIN = 0.0038

// ─── Simulation ───
export const TRAFFIC_REFRESH_MS = 60000
// Clamped to ≤400 total instances for stable frame rate on integrated GPUs
export const VEHICLE_COUNTS = { car: 130, bike: 160, auto: 80, bus: 24 } // = 394 instances
export const CORRIDOR_VEH_PER_HR = 3800 // assumed throughput, for CO₂ model
