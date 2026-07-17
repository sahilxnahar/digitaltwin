import * as THREE from 'three'

// Stylized Basaveshwar Nagar street grid (units ≈ meters)
// Verticals:   Kamakshipalya Main Road (-150), 8th Main Road (-40), West of Chord Road (110)
// Horizontals: Modi Hospital Road (-150), Siddaiah Puranik Road (-30), Magadi Main Road (110)
// Havanur Circle = Siddaiah Puranik Road × 8th Main Road → junction (-40, -30)
//
// NOTE: the two scenario arterials intentionally keep their Z coordinates
// (-150 construction band, 110 VIP band) so the Vehicles.jsx instancing +
// scenario engine works unchanged.
export const ROAD_XS = [-150, -40, 110]
export const ROAD_ZS = [-150, -30, 110]
export const ROAD_W = 13
export const WORLD = 245

export const ROAD_NAMES_X = { '-150': 'Kamakshipalya Main Road', '-40': '8th Main Road', '110': 'West of Chord Road' }
export const ROAD_NAMES_Z = { '-150': 'Modi Hospital Road', '-30': 'Siddaiah Puranik Road', '110': 'Magadi Main Road' }

export const ALL_JUNCTIONS = []
for (const x of ROAD_XS) for (const z of ROAD_ZS) ALL_JUNCTIONS.push({ x, z })

export const SIGNAL_JUNCTIONS = [
  { x: -40, z: -30 }, // Havanur Circle (Siddaiah Puranik Rd × 8th Main Rd)
  { x: -40, z: -150 }, // 8th Main Rd × Modi Hospital Rd
  { x: 110, z: -30 }, // Siddaiah Puranik Rd × West of Chord Rd
  { x: -150, z: 110 }, // Kamakshipalya Main Rd × Magadi Main Rd
]

const SIGNAL_RADIUS = 15
const SAMPLES = 900
const UP_Z = new THREE.Vector3(0, 0, 1)

function roundedRect(x1, z1, x2, z2, r) {
  return [
    [x1 + r, z1], [x2 - r, z1], [x2, z1 + r], [x2, z2 - r],
    [x2 - r, z2], [x1 + r, z2], [x1, z2 - r], [x1, z1 + r],
  ]
}

function buildLoop(x1, z1, x2, z2, laneOffset, reverse) {
  const pts = roundedRect(x1 - laneOffset, z1 - laneOffset, x2 + laneOffset, z2 + laneOffset, 9)
    .map(([x, z]) => new THREE.Vector3(x, 0, z))
  if (reverse) pts.reverse()
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.05)
  const length = curve.getLength()
  const ring = curve.getSpacedPoints(SAMPLES).slice(0, SAMPLES)
  const quats = []
  const tans = []
  for (let i = 0; i < SAMPLES; i++) {
    const a = ring[(i - 1 + SAMPLES) % SAMPLES]
    const b = ring[(i + 1) % SAMPLES]
    const tan = new THREE.Vector3().subVectors(b, a)
    tan.y = 0
    tan.normalize()
    tans.push(tan)
    quats.push(new THREE.Quaternion().setFromUnitVectors(UP_Z, tan))
  }
  // Detect signal stop points: where the loop enters a signalized junction radius
  const signals = []
  for (const j of SIGNAL_JUNCTIONS) {
    const dist = (p) => Math.hypot(p.x - j.x, p.z - j.z)
    let prevIn = dist(ring[SAMPLES - 1]) < SIGNAL_RADIUS
    for (let i = 0; i < SAMPLES; i++) {
      const isIn = dist(ring[i]) < SIGNAL_RADIUS
      if (isIn && !prevIn) {
        const stop = (i - 2 + SAMPLES) % SAMPLES
        const tan = tans[stop]
        signals.push({ t: stop / SAMPLES, axis: Math.abs(tan.x) > Math.abs(tan.z) ? 'EW' : 'NS' })
      }
      prevIn = isIn
    }
  }
  signals.sort((a, b) => a.t - b.t)
  return { ring, quats, length, signals, n: SAMPLES, vehicles: [] }
}

const LANE = 3.4
const LOOP_DEFS = [
  [-150, -150, 110, 110, +LANE, false], // outer ring (arterials)
  [-150, -150, 110, 110, -LANE, true],
  [-40, -150, 110, -30, +LANE, false],
  [-40, -150, 110, -30, -LANE, true],
  [-150, -30, -40, 110, +LANE, false],
  [-150, -30, -40, 110, -LANE, true],
  [-150, -150, -40, -30, -LANE, true],
  [-40, -30, 110, 110, +LANE, false],
]

export const LOOPS = LOOP_DEFS.map((d) => buildLoop(...d))
