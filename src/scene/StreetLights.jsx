import * as THREE from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { ROAD_XS, ROAD_ZS, ROAD_W, WORLD, ALL_JUNCTIONS } from '../paths.js'

const dummy = new THREE.Object3D()

function nearJunction(x, z, r) {
  return ALL_JUNCTIONS.some((j) => Math.hypot(x - j.x, z - j.z) < r)
}

export default function StreetLights({ mode }) {
  const poleRef = useRef()
  const headRef = useRef()

  const poleGeo = useMemo(() => {
    const pole = new THREE.CylinderGeometry(0.09, 0.14, 6.6)
    pole.translate(0, 3.3, 0)
    const arm = new THREE.BoxGeometry(0.14, 0.14, 2.0)
    arm.translate(0, 6.45, 0.95)
    return mergeGeometries([pole, arm])
  }, [])

  const headGeo = useMemo(() => {
    const g = new THREE.SphereGeometry(0.3, 10, 8)
    g.scale(1, 0.6, 1.4)
    g.translate(0, 6.35, 1.85)
    return g
  }, [])

  const headMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fff2cc',
        emissive: new THREE.Color('#ffb84d'),
        emissiveIntensity: 0,
      }),
    []
  )

  useEffect(() => {
    headMat.emissiveIntensity = mode === 'night' ? 4.2 : mode === 'rain' ? 1.6 : 0
  }, [mode, headMat])

  const lights = useMemo(() => {
    const out = []
    const off = ROAD_W / 2 + 1.9
    for (const x of ROAD_XS)
      for (let z = -WORLD + 16; z < WORLD - 16; z += 30)
        if (!nearJunction(x, z, 20)) {
          out.push({ x: x + off, z, rot: -Math.PI / 2 }) // east side, arm points -x
          out.push({ x: x - off, z, rot: Math.PI / 2 })
        }
    for (const z of ROAD_ZS)
      for (let x = -WORLD + 16; x < WORLD - 16; x += 30)
        if (!nearJunction(x, z, 20)) {
          out.push({ x, z: z + off, rot: Math.PI }) // south side, arm points -z
          out.push({ x, z: z - off, rot: 0 })
        }
    return out
  }, [])

  useLayoutEffect(() => {
    lights.forEach((l, i) => {
      dummy.position.set(l.x, 0, l.z)
      dummy.rotation.set(0, l.rot, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      poleRef.current.setMatrixAt(i, dummy.matrix)
      headRef.current.setMatrixAt(i, dummy.matrix)
    })
    poleRef.current.instanceMatrix.needsUpdate = true
    headRef.current.instanceMatrix.needsUpdate = true
  }, [lights])

  return (
    <group>
      <instancedMesh ref={poleRef} args={[poleGeo, undefined, lights.length]} frustumCulled={false}>
        <meshStandardMaterial color="#3c4148" roughness={0.7} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[headGeo, headMat, lights.length]} frustumCulled={false} />
    </group>
  )
}
