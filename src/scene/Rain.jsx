import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const COUNT = 2800
const AREA = 480
const HEIGHT = 130

export default function Rain() {
  const ref = useRef()

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * AREA
      positions[i * 3 + 1] = Math.random() * HEIGHT
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
      speeds[i] = 32 + Math.random() * 18
    }
    return { positions, speeds }
  }, [])

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.06)
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] -= speeds[i] * d
      if (arr[i * 3 + 1] < 0.2) arr[i * 3 + 1] += HEIGHT
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.55} color="#aebfd0" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
    </points>
  )
}
