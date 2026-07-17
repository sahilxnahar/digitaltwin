import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SIGNAL_JUNCTIONS } from '../paths.js'
import { simState } from '../state.js'

export default function TrafficSignals() {
  const lamps = useRef({ nsRed: [], nsGreen: [], ewRed: [], ewGreen: [] })
  const last = useRef('')

  const mats = useMemo(
    () => ({
      redOn: new THREE.MeshStandardMaterial({ color: '#551111', emissive: new THREE.Color('#ff2018'), emissiveIntensity: 3 }),
      redOff: new THREE.MeshStandardMaterial({ color: '#2a0f0f' }),
      greenOn: new THREE.MeshStandardMaterial({ color: '#0f3318', emissive: new THREE.Color('#2aff5a'), emissiveIntensity: 3 }),
      greenOff: new THREE.MeshStandardMaterial({ color: '#0f2a14' }),
    }),
    []
  )

  useFrame(() => {
    if (simState.phase === last.current) return
    last.current = simState.phase
    const nsGreen = simState.phase === 'NS'
    const L = lamps.current
    L.nsGreen.forEach((m) => m && (m.material = nsGreen ? mats.greenOn : mats.greenOff))
    L.nsRed.forEach((m) => m && (m.material = nsGreen ? mats.redOff : mats.redOn))
    L.ewGreen.forEach((m) => m && (m.material = nsGreen ? mats.greenOff : mats.greenOn))
    L.ewRed.forEach((m) => m && (m.material = nsGreen ? mats.redOn : mats.redOff))
  })

  const Head = ({ jIdx, axis, position, rotationY }) => (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[0.55, 1.3, 0.45]} />
        <meshStandardMaterial color="#15181c" />
      </mesh>
      <mesh
        ref={(el) => (lamps.current[axis === 'NS' ? 'nsRed' : 'ewRed'][jIdx] = el)}
        position={[0, 0.34, -0.26]}
      >
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#2a0f0f" />
      </mesh>
      <mesh
        ref={(el) => (lamps.current[axis === 'NS' ? 'nsGreen' : 'ewGreen'][jIdx] = el)}
        position={[0, -0.34, -0.26]}
      >
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#0f2a14" />
      </mesh>
    </group>
  )

  return (
    <group>
      {SIGNAL_JUNCTIONS.map((j, i) => (
        <group key={i} position={[j.x + 9.5, 0, j.z + 9.5]}>
          <mesh position={[0, 2.7, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 5.4]} />
            <meshStandardMaterial color="#3c4148" />
          </mesh>
          <Head jIdx={i} axis="NS" position={[0, 5.1, -0.38]} rotationY={0} />
          <Head jIdx={i} axis="EW" position={[-0.38, 3.9, 0]} rotationY={Math.PI / 2} />
        </group>
      ))}
    </group>
  )
}
