import * as THREE from 'three'
import { useEffect, useMemo, useState } from 'react'
import { Text } from '@react-three/drei'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PLACE_LAT, PLACE_LNG } from '../config.js'
import { fetchOsmBuildings, fetchOsmRoads } from '../services/LocationIntelAPI.js'
import { AmeyaHeightsSite } from './AmeyaHeightsModel.jsx'
import { patchMapState } from '../mapStore.js'

// ─── REAL SITE MODE ───
// Rebuilds the 3D site view from actual geography: live OpenStreetMap road
// centerlines and building footprints around the exact site coordinates.
// Prefers a locally prepared high-accuracy file (Google/Microsoft Open
// Buildings via scripts/prepare_footprints.py) at public/data/, falling
// back to live Overpass. Any failure reverts to the stylized scene.

const M_PER_DEG_LAT = 110540
const M_PER_DEG_LNG = 111320 * Math.cos((PLACE_LAT * Math.PI) / 180)
const toLocal = ([lng, lat]) => [(lng - PLACE_LNG) * M_PER_DEG_LNG, -(lat - PLACE_LAT) * M_PER_DEG_LAT]

const ROAD_WIDTH = {
  motorway: 16, trunk: 14, primary: 12, secondary: 10,
  tertiary: 8, unclassified: 5.5, residential: 6, living_street: 5, service: 4,
}

async function loadLocalOrLive(localName, liveFetcher) {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${localName}`)
    const type = res.headers.get('content-type') || ''
    if (res.ok && !type.includes('text/html')) {
      const gj = await res.json()
      if (gj && Array.isArray(gj.features) && gj.features.length) return gj
    }
  } catch { /* no local file — use live OSM */ }
  return liveFetcher()
}

function buildRoadGeometry(fc) {
  const geos = []
  for (const f of fc.features) {
    const w = ROAD_WIDTH[f.properties.kind] || 5
    const pts = f.geometry.coordinates.map(toLocal)
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i]
      const [x2, z2] = pts[i + 1]
      const dx = x2 - x1
      const dz = z2 - z1
      const len = Math.hypot(dx, dz)
      if (len < 0.5) continue
      const g = new THREE.PlaneGeometry(w, len + w * 0.6)
      g.rotateX(-Math.PI / 2)
      g.rotateY(Math.atan2(dx, dz))
      g.translate((x1 + x2) / 2, 0.02, (z1 + z2) / 2)
      geos.push(g)
    }
  }
  return geos.length ? mergeGeometries(geos) : null
}

function buildBuildingGeometry(fc) {
  const geos = []
  for (const f of fc.features) {
    const coords = f.geometry && f.geometry.coordinates && f.geometry.coordinates[0]
    if (!coords || coords.length < 3) continue
    const ring = coords.map(toLocal)
    const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length
    const cz = ring.reduce((s, p) => s + p[1], 0) / ring.length
    if (Math.hypot(cx, cz) < 45) continue // keep the Ameya plot clear
    if (Math.hypot(cx, cz) > 640) continue
    try {
      const shape = new THREE.Shape(ring.map(([x, z]) => new THREE.Vector2(x, -z)))
      const h = Math.min(Math.max(f.properties.height || 6, 3), 60)
      const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1 })
      g.rotateX(-Math.PI / 2)
      geos.push(g)
    } catch { /* skip degenerate footprints */ }
  }
  return geos.length ? mergeGeometries(geos, false) : null
}

function roadLabels(fc) {
  const seen = new Set()
  const labels = []
  for (const f of fc.features) {
    const name = f.properties.name
    if (!name || seen.has(name)) continue
    seen.add(name)
    const pts = f.geometry.coordinates.map(toLocal)
    const mid = pts[Math.floor(pts.length / 2)]
    const nxt = pts[Math.min(Math.floor(pts.length / 2) + 1, pts.length - 1)]
    if (Math.hypot(mid[0], mid[1]) > 520) continue
    labels.push({ pos: [mid[0], 0.09, mid[1]], rotZ: -Math.atan2(nxt[1] - mid[1], nxt[0] - mid[0]), text: name })
    if (labels.length >= 28) break
  }
  return labels
}

export default function RealSiteScene() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      loadLocalOrLive('site_buildings.geojson', fetchOsmBuildings),
      loadLocalOrLive('site_roads.geojson', fetchOsmRoads),
    ])
      .then(([buildings, roads]) => !cancelled && setData({ buildings, roads }))
      .catch((e) => {
        console.warn('[RealSite] live geography unavailable — reverting to stylized scene.', e && e.message)
        patchMapState({ siteMode: 'stylized' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const built = useMemo(() => {
    if (!data) return null
    return {
      roads: buildRoadGeometry(data.roads),
      buildings: buildBuildingGeometry(data.buildings),
      labels: roadLabels(data.roads),
    }
  }, [data])

  return (
    <group>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1500, 1500]} />
        <meshStandardMaterial color="#39413a" roughness={1} />
      </mesh>

      {!built && (
        <Text position={[0, 12, 0]} fontSize={7} color="#e6d7b2" anchorX="center" letterSpacing={0.2}>
          LOADING REAL GEOGRAPHY…
        </Text>
      )}

      {built && built.roads && (
        <mesh geometry={built.roads} receiveShadow>
          <meshStandardMaterial color="#292d33" roughness={0.92} />
        </mesh>
      )}
      {built && built.buildings && (
        <mesh geometry={built.buildings} castShadow receiveShadow>
          <meshStandardMaterial color="#c6bfae" roughness={0.9} />
        </mesh>
      )}
      {built &&
        built.labels.map((l, i) => (
          <Text
            key={i}
            position={l.pos}
            rotation={[-Math.PI / 2, 0, l.rotZ]}
            fontSize={3.4}
            color="#cfd6dd"
            fillOpacity={0.85}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {l.text}
          </Text>
        ))}

      {/* Ameya Heights at the exact site coordinates (scene origin) */}
      <AmeyaHeightsSite position={[0, 0, 0]} />

      {/* site plot marker ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[42, 45, 48]} />
        <meshBasicMaterial color="#e6d7b2" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
