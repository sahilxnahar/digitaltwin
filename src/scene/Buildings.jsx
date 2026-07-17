import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROAD_XS, ROAD_ZS, WORLD } from '../paths.js'
import { simState } from '../state.js'
import { AmeyaHeightsSite } from './AmeyaHeightsModel.jsx'

// Empty plot on the north-west corner of Havanur Circle
// (Siddaiah Puranik Road × 8th Main Road), reserved for the
// proposed development (A/B toggled from the HUD)
const PLOT = { x: -95, z: 40, r: 38 }

const dummy = new THREE.Object3D()
const tmpColor = new THREE.Color()

const TINTS = ['#f5e9d2', '#e8d5b5', '#d9c6a8', '#cfd4d8', '#e2b28c', '#f0e6c8', '#d8cdb4']

// zones reserved for landmarks / park: [x1, x2, z1, z2]
const EXCLUDE = [
  [-140, -50, -228, -158], // KLE S. Nijalingappa College campus
  [124, 186, -142, -74],   // Havanur Complex
  [-18, 48, -18, 48],      // Basaveshwar Nagar park
]

function inExclude(x, z) {
  return EXCLUDE.some(([x1, x2, z1, z2]) => x > x1 && x < x2 && z > z1 && z < z2)
}

function intervals(lines) {
  const edges = [-WORLD, ...lines, WORLD]
  const out = []
  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i] + (i === 0 ? 10 : 15)
    const b = edges[i + 1] - (i === edges.length - 2 ? 10 : 15)
    if (b - a > 16) out.push([a, b])
  }
  return out
}

function makeFacadeTextures() {
  const w = 128
  const h = 256
  const day = document.createElement('canvas')
  day.width = w
  day.height = h
  const ctx = day.getContext('2d')
  ctx.fillStyle = '#b8ad9a'
  ctx.fillRect(0, 0, w, h)
  const em = document.createElement('canvas')
  em.width = w
  em.height = h
  const ectx = em.getContext('2d')
  ectx.fillStyle = '#000'
  ectx.fillRect(0, 0, w, h)
  for (let y = 10; y < h - 12; y += 18) {
    for (let x = 8; x < w - 12; x += 16) {
      ctx.fillStyle = '#3a4048'
      ctx.fillRect(x, y, 9, 11)
      if (Math.random() < 0.42) {
        ectx.fillStyle = ['#ffca7a', '#ffe3b0', '#bfd4ff'][Math.floor(Math.random() * 3)]
        ectx.fillRect(x, y, 9, 11)
      }
    }
  }
  const map = new THREE.CanvasTexture(day)
  map.colorSpace = THREE.SRGBColorSpace
  const emissiveMap = new THREE.CanvasTexture(em)
  emissiveMap.colorSpace = THREE.SRGBColorSpace
  return { map, emissiveMap }
}

function makeSignTexture(title, sub, premium = false) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const x = c.getContext('2d')
  if (premium) {
    // matches the LoadingScreen typography: champagne serif on deep charcoal
    x.fillStyle = '#0e1117'
    x.fillRect(0, 0, 512, 128)
    x.strokeStyle = '#e6d7b2'
    x.lineWidth = 3
    x.strokeRect(8, 8, 496, 112)
    x.strokeRect(14, 14, 484, 100)
    x.fillStyle = '#e6d7b2'
    x.textAlign = 'center'
    x.font = "bold 44px Didot, 'Bodoni MT', 'Playfair Display', Georgia, serif"
    x.fillText(title, 256, sub ? 58 : 78)
    if (sub) {
      x.font = "22px Georgia, 'Times New Roman', serif"
      x.fillStyle = '#9aa3ad'
      x.fillText(sub, 256, 96)
    }
  } else {
    x.fillStyle = '#123a2e'
    x.fillRect(0, 0, 512, 128)
    x.strokeStyle = '#e8e3d5'
    x.lineWidth = 6
    x.strokeRect(6, 6, 500, 116)
    x.fillStyle = '#f3efe2'
    x.textAlign = 'center'
    x.font = 'bold 42px sans-serif'
    x.fillText(title, 256, sub ? 56 : 76)
    if (sub) {
      x.font = '26px sans-serif'
      x.fillText(sub, 256, 98)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function SignBoard({ title, sub, position, rotationY = 0, width = 11, premium = false }) {
  const tex = useMemo(() => makeSignTexture(title, sub, premium), [title, sub, premium])
  const h = width / 4
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-width / 2 + 0.5, width / 2 - 0.5].map((px, i) => (
        <mesh key={i} position={[px, 2, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 4]} />
          <meshStandardMaterial color="#4a4f56" />
        </mesh>
      ))}
      <mesh position={[0, 4 + h / 2 - 0.4, 0]}>
        <boxGeometry args={[width, h, 0.15]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

export default function Buildings({ mode, onSelect }) {
  const meshRef = useRef()
  const { map, emissiveMap } = useMemo(() => makeFacadeTextures(), [])

  // Mirror simState.showDevelopment into React state so the proposed
  // building mounts/unmounts instantly when the HUD toggle flips
  const [showDev, setShowDev] = useState(simState.showDevelopment)
  useFrame(() => {
    if (simState.showDevelopment !== showDev) setShowDev(simState.showDevelopment)
  })

  const sideMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        emissiveMap,
        emissive: new THREE.Color('#ffd9a0'),
        emissiveIntensity: 0.05,
        roughness: 0.85,
      }),
    [map, emissiveMap]
  )
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a8378', roughness: 0.95 }), [])
  const glassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7fa8c8',
        metalness: 0.85,
        roughness: 0.18,
        emissive: new THREE.Color('#bfd8ff'),
        emissiveIntensity: 0.06,
      }),
    []
  )

  useEffect(() => {
    const e = mode === 'night' ? 1.15 : mode === 'rain' ? 0.28 : 0.05
    sideMat.emissiveIntensity = e
    glassMat.emissiveIntensity = mode === 'night' ? 0.7 : 0.06
  }, [mode, sideMat, glassMat])

  // materials array: box groups order +x,-x,+y,-y,+z,-z
  const mats = useMemo(() => [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat], [sideMat, roofMat])

  const items = useMemo(() => {
    const rng = () => Math.random()
    const out = []
    for (const [x1, x2] of intervals(ROAD_XS)) {
      for (const [z1, z2] of intervals(ROAD_ZS)) {
        for (let gx = x1 + 10; gx < x2 - 8; gx += 26) {
          for (let gz = z1 + 10; gz < z2 - 8; gz += 26) {
            if (rng() < 0.22) continue
            const x = gx + (rng() - 0.5) * 8
            const z = gz + (rng() - 0.5) * 8
            if (inExclude(x, z)) continue
            if (Math.hypot(x - PLOT.x, z - PLOT.z) < PLOT.r) continue // carved-out plot
            const r = rng()
            const h = r < 0.68 ? 8 + rng() * 10 : r < 0.94 ? 18 + rng() * 12 : 30 + rng() * 12
            out.push({ x, z, w: 11 + rng() * 9, d: 11 + rng() * 9, h })
            if (out.length >= 320) return out
          }
        }
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    items.forEach((b, i) => {
      dummy.position.set(b.x, 0, b.z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(b.w, b.h, b.d)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, tmpColor.set(TINTS[Math.floor(Math.random() * TINTS.length)]))
    })
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [items])

  const hover = (on) => (e) => {
    e.stopPropagation()
    document.body.style.cursor = on ? 'pointer' : 'auto'
  }

  const boxGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1)
    g.translate(0, 0.5, 0)
    return g
  }, [])

  return (
    <group>
      {/* background stock: no shadow casting (perf) — still receives the
          proposed tower's shadow for the A/B impact study */}
      <instancedMesh
        ref={meshRef}
        args={[boxGeo, mats, items.length]}
        receiveShadow
        frustumCulled={false}
      />

      {/* ── KLE S. Nijalingappa College campus (clickable landmark) ── */}
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('KLE S. Nijalingappa College') }}
        onPointerOver={hover(true)}
        onPointerOut={hover(false)}
      >
        <mesh position={[-95, 8, -196]} receiveShadow>
          <boxGeometry args={[74, 16, 28]} />
          <meshStandardMaterial color="#ece0c4" roughness={0.9} />
        </mesh>
        <mesh position={[-95, 16.8, -196]}>
          <boxGeometry args={[75, 1.6, 29]} />
          <meshStandardMaterial color="#8e3b2f" roughness={0.9} />
        </mesh>
        <mesh position={[-63, 6, -178]} receiveShadow>
          <boxGeometry args={[24, 12, 26]} />
          <meshStandardMaterial color="#e3d5b2" roughness={0.9} />
        </mesh>
        <mesh position={[-125, 11, -180]} receiveShadow>
          <boxGeometry args={[18, 22, 18]} />
          <meshStandardMaterial color="#ece0c4" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Havanur Complex (glassy, clickable) ── */}
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('Havanur Complex · West of Chord Rd') }}
        onPointerOver={hover(true)}
        onPointerOut={hover(false)}
      >
        <mesh position={[156, 13, -108]} receiveShadow material={glassMat}>
          <boxGeometry args={[48, 26, 44]} />
        </mesh>
        <mesh position={[156, 27.5, -108]}>
          <boxGeometry args={[36, 3, 32]} />
          <meshStandardMaterial color="#5b6570" roughness={0.7} />
        </mesh>
      </group>

      {/* ── Basaveshwar Nagar park (clickable "the place") ── */}
      <group
        onClick={(e) => { e.stopPropagation(); onSelect('Basaveshwar Nagar') }}
        onPointerOver={hover(true)}
        onPointerOut={hover(false)}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, 0.05, 15]} receiveShadow>
          <circleGeometry args={[30, 32]} />
          <meshStandardMaterial color="#3e5a33" roughness={1} />
        </mesh>
        <mesh position={[15, 1.4, 15]}>
          <cylinderGeometry args={[3.2, 3.6, 2.8, 8]} />
          <meshStandardMaterial color="#b8ad9a" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Ameya Heights — semi-commercial development (A/B toggle) ── */}
      {showDev && (
        <group
          onClick={(e) => { e.stopPropagation(); onSelect('Ameya Heights') }}
          onPointerOver={hover(true)}
          onPointerOut={hover(false)}
        >
          <AmeyaHeightsSite position={[PLOT.x, 0, PLOT.z]} />
          <SignBoard
            title="AMEYA HEIGHTS"
            sub="S.V. Consultants · Semi-Commercial"
            position={[PLOT.x, 0, PLOT.z - 24]}
            width={12}
            premium
          />
        </group>
      )}

      {/* signage */}
      <SignBoard title="BASAVESHWAR NAGAR" sub="Bengaluru — 560079" position={[-64, 0, -52]} rotationY={Math.PI / 4} width={13} />
      <SignBoard title="Havanur Circle" sub="Siddaiah Puranik Road" position={[-16, 0, -52]} rotationY={-Math.PI / 4} width={11} />
      <SignBoard title="KLE S. Nijalingappa College" sub="Modi Hospital Road" position={[-95, 0, -160]} width={13} />
      <SignBoard title="Modi Hospital Road" position={[40, 0, -160]} width={10} />
      <SignBoard title="Kamakshipalya Main Road" position={[-160, 0, 20]} rotationY={Math.PI / 2} width={12} />
      <SignBoard title="8th Main Road" position={[-50, 0, -105]} rotationY={Math.PI / 2} width={9} />
      <SignBoard title="Magadi Main Road" position={[60, 0, 120]} rotationY={Math.PI} width={10} />
      <SignBoard title="West of Chord Road" position={[120, 0, 60]} rotationY={-Math.PI / 2} width={10} />
    </group>
  )
}
