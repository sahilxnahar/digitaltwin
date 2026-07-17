import * as THREE from 'three'
import { useMemo } from 'react'

// Proposed semi-commercial development: solid podium + sleek glass tower.
// Deliberately contrasts with the matte instanced stock (high metalness,
// low roughness) while still sitting naturally in the cinematic light.
// Root position defaults to the Havanur Circle plot (kept in sync with
// PLOT in Buildings.jsx, which passes it explicitly).
export default function ProposedBuilding({ position = [-95, 0, 40] }) {
  const glass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5f93bd',
        metalness: 0.92,
        roughness: 0.1,
        emissive: new THREE.Color('#9cc4e8'),
        emissiveIntensity: 0.12, // faint interior glow — reads well at night via bloom
      }),
    []
  )
  const podium = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d3ccbd', roughness: 0.8, metalness: 0.05 }),
    []
  )
  const fin = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#88929c', metalness: 0.8, roughness: 0.35 }),
    []
  )

  return (
    <group position={position}>
      {/* plaza slab */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[40, 0.3, 32]} />
        <meshStandardMaterial color="#b9b2a2" roughness={0.9} />
      </mesh>

      {/* solid podium base (retail levels) */}
      <mesh position={[0, 4.3, 0]} castShadow receiveShadow material={podium}>
        <boxGeometry args={[34, 8, 26]} />
      </mesh>
      {/* podium glass band */}
      <mesh position={[0, 8.7, 0]} castShadow material={glass}>
        <boxGeometry args={[32.5, 1.2, 24.5]} />
      </mesh>

      {/* sleek glass tower */}
      <mesh position={[-3, 31.3, 0]} castShadow receiveShadow material={glass}>
        <boxGeometry args={[20, 46, 16]} />
      </mesh>
      {/* vertical fins / mullions */}
      {[-8, -4, 0, 4, 8].map((x) => (
        <mesh key={x} position={[-3 + x, 31.3, 0]} castShadow material={fin}>
          <boxGeometry args={[0.35, 46, 16.6]} />
        </mesh>
      ))}

      {/* service core */}
      <mesh position={[8.5, 26.3, -2]} castShadow receiveShadow material={podium}>
        <boxGeometry args={[7, 36, 10]} />
      </mesh>

      {/* crown */}
      <mesh position={[-3, 55.1, 0]} castShadow material={fin}>
        <boxGeometry args={[21, 1.6, 17]} />
      </mesh>
    </group>
  )
}
