import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LOOPS } from '../paths.js'
import { simState, SIGNAL_CYCLE } from '../state.js'
import { VEHICLE_COUNTS } from '../config.js'

const PALETTES = {
  car: ['#d8d8d8', '#f2f2f2', '#7a7f87', '#2e3237', '#8e1f24', '#274b7a', '#b8b39a', '#5e666e'],
  bike: ['#22262b', '#5a1d1d', '#1d3a5a', '#3a3f45', '#7a2230'],
  auto: ['#3f6b34', '#456e3a', '#e8c832', '#3a6531'],
  bus: ['#5b7fae', '#6a4f9e', '#7d8a99', '#4d6e9e'],
}

function carGeo() {
  const a = new THREE.BoxGeometry(1.8, 0.85, 4.1)
  a.translate(0, 0.68, 0)
  const b = new THREE.BoxGeometry(1.6, 0.65, 2.0)
  b.translate(0, 1.4, -0.25)
  return mergeGeometries([a, b])
}
function bikeGeo() {
  const a = new THREE.BoxGeometry(0.5, 0.75, 1.9)
  a.translate(0, 0.62, 0)
  const b = new THREE.BoxGeometry(0.55, 0.85, 0.6)
  b.translate(0, 1.4, -0.2)
  return mergeGeometries([a, b])
}
function autoGeo() {
  const a = new THREE.BoxGeometry(1.5, 1.35, 2.6)
  a.translate(0, 0.95, 0)
  const b = new THREE.BoxGeometry(0.9, 0.35, 0.5)
  b.translate(0, 0.55, 1.5)
  return mergeGeometries([a, b])
}
function busGeo() {
  const g = new THREE.BoxGeometry(2.5, 3.0, 10.5)
  g.translate(0, 1.65, 0)
  return g
}

const TYPES = [
  { name: 'car', geo: carGeo, base: 11, len: 4.6 },
  { name: 'bike', geo: bikeGeo, base: 12.5, len: 2.4 },
  { name: 'auto', geo: autoGeo, base: 9, len: 3.2 },
  { name: 'bus', geo: busGeo, base: 8.5, len: 11 },
]

const dummy = new THREE.Object3D()
const tmpColor = new THREE.Color()
const jamColor = new THREE.Color('#e8564a') // live congestion tint: jammed
const flowColor = new THREE.Color('#4ad675') // live congestion tint: free flow
const congColor = new THREE.Color()

// ─── Scenario metadata, precomputed ONCE at module init (O(1) lookups in the
// hot sub-stepped loop — no per-frame allocation, 60fps preserved) ───
const MILLERS_Z = -150 // Millers Road centerline
const QUEENS_Z = 110 // Queens Road centerline
const CONSTRUCTION_CRAWL = 0.12 // speed multiplier through the lane closure

for (const loop of LOOPS) {
  if (loop.onMillers) continue // already augmented (HMR safety)
  const n = loop.n
  const onMillers = new Uint8Array(n)
  const onQueens = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const p = loop.ring[i]
    const a = loop.ring[(i - 1 + n) % n]
    const b = loop.ring[(i + 1) % n]
    const headingEW = Math.abs(b.x - a.x) > Math.abs(b.z - a.z)
    if (headingEW && Math.abs(p.z - MILLERS_Z) < 9) onMillers[i] = 1
    if (headingEW && Math.abs(p.z - QUEENS_Z) < 9) onQueens[i] = 1
  }
  loop.onMillers = onMillers
  loop.onQueens = onQueens
  // Tag signals that sit on Queens Road controlling EW flow — held red in VIP mode
  for (const sig of loop.signals) {
    const p = loop.ring[Math.min(n - 1, Math.round(sig.t * n))]
    sig.vipRed = sig.axis === 'EW' && Math.abs(p.z - QUEENS_Z) < 22
  }
}

function stepSim(h) {
  const green = simState.phase
  const scenario = simState.scenario
  const cong = THREE.MathUtils.clamp(simState.congestion, 0.15, 1.2)
  for (const loop of LOOPS) {
    const arr = loop.vehicles
    const n = arr.length
    const L = loop.length
    const nS = loop.n
    const onM = loop.onMillers
    const onQ = loop.onQueens
    for (let i = 0; i < n; i++) {
      const v = arr[i]
      let target = v.base * cong

      // ── scenario overrides (flat typed-array lookups) ──
      const si = Math.min(nS - 1, (v.t * nS) | 0)
      if (scenario === 'construction' && onM[si]) {
        target *= CONSTRUCTION_CRAWL // heavy lane closure on Millers Road
      } else if (scenario === 'vip' && onQ[si]) {
        target = 0 // engineered gridlock: Queens Road axis fully held
      }

      // red signal ahead → decelerate and stop at the line
      // (in VIP mode, Queens Road EW signals are permanently red)
      for (let s = 0; s < loop.signals.length; s++) {
        const sig = loop.signals[s]
        const heldRed = scenario === 'vip' && sig.vipRed
        if (!heldRed && sig.axis === green) continue
        let d = sig.t - v.t
        if (d < 0) d += 1
        d *= L
        if (d < 40) {
          target = Math.min(target, v.base * cong * Math.max(0, (d - 3) / 40))
          if (d < 3) target = 0
        }
      }
      // keep distance from vehicle ahead (queueing)
      if (n > 1) {
        const ahead = arr[(i + 1) % n]
        let g = ahead.t - v.t
        if (g <= 0) g += 1
        g = g * L - ahead.len
        if (g < 14) {
          target = Math.min(target, Math.max(0, ahead.speed * (g / 14)))
          if (g < 3) target = 0
        }
      }
      v.speed = target > v.speed ? Math.min(v.speed + 3.2 * h, target) : Math.max(v.speed - 9 * h, target)
      v.t += (v.speed * h) / L
      if (v.t >= 1) v.t -= 1
    }
  }
}

export default function Vehicles({ mode }) {
  const refs = useRef([])
  const baseColors = useRef([]) // per-type Float32Array of un-tinted instance colors
  const lastCongestion = useRef(-1)

  const { geos, mats } = useMemo(
    () => ({
      geos: TYPES.map((t) => t.geo()),
      mats: TYPES.map(
        () =>
          new THREE.MeshStandardMaterial({
            metalness: 0.35,
            roughness: 0.55,
            emissive: new THREE.Color('#ffb36b'),
            emissiveIntensity: 0.03,
          })
      ),
    }),
    []
  )

  useEffect(() => {
    const e = mode === 'night' ? 0.5 : mode === 'rain' ? 0.15 : 0.03
    mats.forEach((m) => (m.emissiveIntensity = e))
  }, [mode, mats])

  // Populate loops with vehicles (once)
  useMemo(() => {
    LOOPS.forEach((l) => (l.vehicles = []))
    const cum = []
    let tot = 0
    LOOPS.forEach((l) => {
      tot += l.length
      cum.push(tot)
    })
    const pickLoop = () => {
      const r = Math.random() * tot
      for (let i = 0; i < LOOPS.length; i++) if (r <= cum[i]) return LOOPS[i]
      return LOOPS[LOOPS.length - 1]
    }
    const counts = [VEHICLE_COUNTS.car, VEHICLE_COUNTS.bike, VEHICLE_COUNTS.auto, VEHICLE_COUNTS.bus]
    TYPES.forEach((t, ti) => {
      for (let k = 0; k < counts[ti]; k++) {
        // buses stick to the arterial loops
        const loop = t.name === 'bus' ? LOOPS[Math.floor(Math.random() * 4)] : pickLoop()
        loop.vehicles.push({
          type: ti,
          idx: k,
          t: Math.random(),
          speed: 1 + Math.random() * 4,
          base: t.base * (0.8 + 0.4 * Math.random()),
          len: t.len,
        })
      }
    })
  }, [])

  // Per-instance colors
  useLayoutEffect(() => {
    const counts = [VEHICLE_COUNTS.car, VEHICLE_COUNTS.bike, VEHICLE_COUNTS.auto, VEHICLE_COUNTS.bus]
    TYPES.forEach((t, ti) => {
      const mesh = refs.current[ti]
      if (!mesh) return
      const pal = PALETTES[t.name]
      const base = new Float32Array(counts[ti] * 3)
      for (let k = 0; k < counts[ti]; k++) {
        tmpColor.set(pal[Math.floor(Math.random() * pal.length)])
        base[k * 3] = tmpColor.r
        base[k * 3 + 1] = tmpColor.g
        base[k * 3 + 2] = tmpColor.b
        mesh.setColorAt(k, tmpColor)
      }
      baseColors.current[ti] = base
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    })
    lastCongestion.current = -1 // force a live-traffic restyle on first frame
  }, [])

  useFrame((_, delta) => {
    // ── Live TomTom congestion → visible density + color tint ──
    // Runs only when the 60s feed actually changes, never per frame.
    const cong = simState.congestion
    if (Math.abs(cong - lastCongestion.current) > 0.02) {
      lastCongestion.current = cong
      const jam = 1 - THREE.MathUtils.clamp((cong - 0.3) / 0.7, 0, 1) // 1 = gridlock
      congColor.copy(flowColor).lerp(jamColor, jam)
      const cts = [VEHICLE_COUNTS.car, VEHICLE_COUNTS.bike, VEHICLE_COUNTS.auto, VEHICLE_COUNTS.bus]
      TYPES.forEach((t, ti) => {
        const mesh = refs.current[ti]
        const base = baseColors.current[ti]
        if (!mesh || !base) return
        // density: jammed roads fill up, free-flowing roads thin out
        mesh.count = Math.max(6, Math.round(cts[ti] * (0.55 + 0.45 * jam)))
        // tint: subtle blend of each body color toward the congestion color
        for (let k = 0; k < cts[ti]; k++) {
          tmpColor.setRGB(base[k * 3], base[k * 3 + 1], base[k * 3 + 2])
          tmpColor.lerp(congColor, 0.22)
          mesh.setColorAt(k, tmpColor)
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      })
    }

    const dt = Math.min(delta, 0.1) * simState.simSpeed
    simState.time += dt
    simState.phase = simState.time % SIGNAL_CYCLE < SIGNAL_CYCLE * 0.52 ? 'NS' : 'EW'

    for (const loop of LOOPS) loop.vehicles.sort((a, b) => a.t - b.t)
    const sub = Math.max(1, Math.min(24, Math.ceil(dt / 0.07)))
    const h = dt / sub
    for (let s = 0; s < sub; s++) stepSim(h)

    for (const loop of LOOPS) {
      const n = loop.n
      for (const v of loop.vehicles) {
        const f = (((v.t % 1) + 1) % 1) * n
        const i0 = Math.floor(f) % n
        const i1 = (i0 + 1) % n
        dummy.position.lerpVectors(loop.ring[i0], loop.ring[i1], f - Math.floor(f))
        dummy.position.y = 0.06
        dummy.quaternion.copy(loop.quats[i0])
        dummy.updateMatrix()
        const mesh = refs.current[v.type]
        if (mesh) mesh.setMatrixAt(v.idx, dummy.matrix)
      }
    }
    refs.current.forEach((m) => m && (m.instanceMatrix.needsUpdate = true))
  })

  const counts = [VEHICLE_COUNTS.car, VEHICLE_COUNTS.bike, VEHICLE_COUNTS.auto, VEHICLE_COUNTS.bus]

  return (
    <group>
      {TYPES.map((t, ti) => (
        <instancedMesh
          key={t.name}
          ref={(el) => (refs.current[ti] = el)}
          args={[geos[ti], mats[ti], counts[ti]]}
          castShadow // shadows reserved for immediate traffic + the proposed building
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
