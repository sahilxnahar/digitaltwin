import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { ROAD_XS, ROAD_ZS, ROAD_W, WORLD, ALL_JUNCTIONS } from '../paths.js'

const dummy = new THREE.Object3D()
const tmpColor = new THREE.Color()
const GREENS = ['#4a7a3a', '#3e6b31', '#5c8a46', '#6b9a50', '#38622c']

function nearJunction(x, z, r) {
  return ALL_JUNCTIONS.some((j) => Math.hypot(x - j.x, z - j.z) < r)
}
function onRoad(x, z) {
  const m = ROAD_W / 2 + 4.5
  return ROAD_XS.some((rx) => Math.abs(x - rx) < m) || ROAD_ZS.some((rz) => Math.abs(z - rz) < m)
}

export default function Trees() {
  const trunkRef = useRef()
  const leafRef = useRef()

  const trees = useMemo(() => {
    const out = []
    const off = ROAD_W / 2 + 4.2
    // avenue trees along roads
    for (const x of ROAD_XS)
      for (let z = -WORLD + 12; z < WORLD - 12; z += 24)
        if (!nearJunction(x, z, 22))
          for (const s of [-1, 1]) out.push({ x: x + s * off, z: z + (Math.random() - 0.5) * 4, s: 0.8 + Math.random() * 0.7 })
    for (const z of ROAD_ZS)
      for (let x = -WORLD + 12; x < WORLD - 12; x += 24)
        if (!nearJunction(x, z, 22))
          for (const s of [-1, 1]) out.push({ x: x + (Math.random() - 0.5) * 4, z: z + s * off, s: 0.8 + Math.random() * 0.7 })
    // park cluster
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 6 + Math.random() * 22
      out.push({ x: 15 + Math.cos(a) * r, z: 15 + Math.sin(a) * r, s: 1 + Math.random() * 0.9 })
    }
    // scattered block trees
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 2 * (WORLD - 15)
      const z = (Math.random() - 0.5) * 2 * (WORLD - 15)
      if (!onRoad(x, z)) out.push({ x, z, s: 0.7 + Math.random() * 0.8 })
    }
    return out
  }, [])

  useLayoutEffect(() => {
    trees.forEach((t, i) => {
      dummy.position.set(t.x, 0, t.z)
      dummy.rotation.set(0, Math.random() * Math.PI, 0)
      dummy.scale.setScalar(t.s)
      dummy.updateMatrix()
      trunkRef.current.setMatrixAt(i, dummy.matrix)
      leafRef.current.setMatrixAt(i, dummy.matrix)
      leafRef.current.setColorAt(i, tmpColor.set(GREENS[Math.floor(Math.random() * GREENS.length)]))
    })
    trunkRef.current.instanceMatrix.needsUpdate = true
    leafRef.current.instanceMatrix.needsUpdate = true
    if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true
  }, [trees])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.18, 0.3, 2.6]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={leafRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
    </group>
  )
}
