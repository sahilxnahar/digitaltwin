import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROAD_XS, ROAD_ZS, ROAD_W, WORLD, ALL_JUNCTIONS, SIGNAL_JUNCTIONS } from '../paths.js'
import { simState } from '../state.js'

const dummy = new THREE.Object3D()

function nearJunction(x, z, r) {
  return ALL_JUNCTIONS.some((j) => Math.hypot(x - j.x, z - j.z) < r)
}

export default function Ground({ mode }) {
  const asphalt = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#23262b', roughness: 0.92, metalness: 0 }),
    []
  )
  const pavementMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#6f6a60', roughness: 0.95 }),
    []
  )
  const paintMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8d5c8', roughness: 0.8 }),
    []
  )
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#2ecc71',
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  )

  useEffect(() => {
    if (mode === 'rain') {
      // glossy water sheet: near-mirror roughness + metalness so the wet
      // asphalt catches headlights, streetlamp glow and the overcast sky
      asphalt.color.set('#0b0e12')
      asphalt.roughness = 0.08
      asphalt.metalness = 0.4
      pavementMat.color.set('#4c4841')
    } else if (mode === 'night') {
      asphalt.color.set('#1d2025')
      asphalt.roughness = 0.85
      asphalt.metalness = 0.05
      pavementMat.color.set('#565248')
    } else {
      asphalt.color.set('#23262b')
      asphalt.roughness = 0.92
      asphalt.metalness = 0
      pavementMat.color.set('#6f6a60')
    }
  }, [mode, asphalt, pavementMat])

  // Congestion glow color: green (free) → amber → red (jammed)
  useFrame(() => {
    const t = THREE.MathUtils.clamp((simState.congestion - 0.3) / 0.7, 0, 1)
    glowMat.color.setRGB(0.95 - 0.75 * t, 0.25 + 0.65 * t, 0.22)
  })

  // ── Static instanced geometry data ──
  const { dashes, zebras, pavements } = useMemo(() => {
    const dashes = []
    for (const x of ROAD_XS)
      for (let z = -WORLD + 8; z < WORLD - 8; z += 6)
        if (!nearJunction(x, z, 18)) dashes.push({ x, z, rot: 0 })
    for (const z of ROAD_ZS)
      for (let x = -WORLD + 8; x < WORLD - 8; x += 6)
        if (!nearJunction(x, z, 18)) dashes.push({ x, z, rot: Math.PI / 2 })

    const zebras = []
    for (const j of SIGNAL_JUNCTIONS) {
      for (const side of [-1, 1]) {
        // crossings over the vertical road (bars long in z, stepped in x)
        for (let k = -3; k <= 3; k++)
          zebras.push({ x: j.x + k * 1.7, z: j.z + side * 12.5, rot: 0 })
        // crossings over the horizontal road
        for (let k = -3; k <= 3; k++)
          zebras.push({ x: j.x + side * 12.5, z: j.z + k * 1.7, rot: Math.PI / 2 })
      }
    }

    // pavement segments between junctions, both sides of every road
    const pavements = []
    const segsAlong = (crossLines) => {
      const cuts = [-WORLD, ...crossLines, WORLD]
      const out = []
      for (let i = 0; i < cuts.length - 1; i++) {
        const a = cuts[i] + (i === 0 ? 2 : 11)
        const b = cuts[i + 1] - (i === cuts.length - 2 ? 2 : 11)
        if (b - a > 6) out.push([(a + b) / 2, b - a])
      }
      return out
    }
    const off = ROAD_W / 2 + 1.7
    for (const x of ROAD_XS)
      for (const [mid, len] of segsAlong(ROAD_ZS))
        for (const s of [-1, 1]) pavements.push({ x: x + s * off, z: mid, len, rot: 0 })
    for (const z of ROAD_ZS)
      for (const [mid, len] of segsAlong(ROAD_XS))
        for (const s of [-1, 1]) pavements.push({ x: mid, z: z + s * off, len, rot: Math.PI / 2 })

    return { dashes, zebras, pavements }
  }, [])

  const dashRef = useRef()
  const zebraRef = useRef()
  const paveRef = useRef()

  useLayoutEffect(() => {
    dashes.forEach((d, i) => {
      dummy.position.set(d.x, 0.06, d.z)
      dummy.rotation.set(0, d.rot, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      dashRef.current.setMatrixAt(i, dummy.matrix)
    })
    dashRef.current.instanceMatrix.needsUpdate = true

    zebras.forEach((zb, i) => {
      dummy.position.set(zb.x, 0.065, zb.z)
      dummy.rotation.set(0, zb.rot, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      zebraRef.current.setMatrixAt(i, dummy.matrix)
    })
    zebraRef.current.instanceMatrix.needsUpdate = true

    pavements.forEach((p, i) => {
      dummy.position.set(p.x, 0.14, p.z)
      dummy.rotation.set(0, p.rot, 0)
      dummy.scale.set(1, 1, p.len)
      dummy.updateMatrix()
      paveRef.current.setMatrixAt(i, dummy.matrix)
    })
    paveRef.current.instanceMatrix.needsUpdate = true
  }, [dashes, zebras, pavements])

  return (
    <group>
      {/* terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial color="#39413a" roughness={1} />
      </mesh>

      {/* roads */}
      {ROAD_XS.map((x) => (
        <mesh key={`vx${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, 0]} receiveShadow material={asphalt}>
          <planeGeometry args={[ROAD_W, WORLD * 2]} />
        </mesh>
      ))}
      {ROAD_ZS.map((z) => (
        <mesh key={`hz${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, z]} receiveShadow material={asphalt}>
          <planeGeometry args={[WORLD * 2, ROAD_W]} />
        </mesh>
      ))}

      {/* lane dashes */}
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]} material={paintMat} frustumCulled={false}>
        <boxGeometry args={[0.16, 0.02, 2.4]} />
      </instancedMesh>

      {/* zebra crossings */}
      <instancedMesh ref={zebraRef} args={[undefined, undefined, zebras.length]} material={paintMat} frustumCulled={false}>
        <boxGeometry args={[1.05, 0.02, 3.1]} />
      </instancedMesh>

      {/* pavements */}
      <instancedMesh ref={paveRef} args={[undefined, undefined, pavements.length]} material={pavementMat} receiveShadow frustumCulled={false}>
        <boxGeometry args={[3.2, 0.28, 1]} />
      </instancedMesh>

      {/* congestion glow strips on the two arterials */}
      {[-1, 1].map((s) => (
        <mesh key={`gz${s}`} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_W / 2 - 0.5) - 150, 0.045, 0]} material={glowMat}>
          <planeGeometry args={[0.5, WORLD * 2]} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`gx${s}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, s * (ROAD_W / 2 - 0.5) - 150]} material={glowMat}>
          <planeGeometry args={[WORLD * 2, 0.5]} />
        </mesh>
      ))}
    </group>
  )
}
