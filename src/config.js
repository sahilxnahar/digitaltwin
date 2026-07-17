// ═══════════════════ CUSTOMIZE THESE ═══════════════════
export const CITY = 'Bengaluru'
export const PLACE_NAME = 'Basaveshwar Nagar'
export const PLACE_LAT = 12.9914
export const PLACE_LNG = 77.5393
// ════════════════════════════════════════════════════════

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
// Temporarily clamped to ≤400 total instances to stabilize frame rate on
// integrated/Retina GPUs (was car:430 bike:560 auto:270 bus:64 ≈ 1324)
export const VEHICLE_COUNTS = { car: 130, bike: 160, auto: 80, bus: 24 } // = 394 instances
export const CORRIDOR_VEH_PER_HR = 3800 // assumed throughput, for CO₂ model
