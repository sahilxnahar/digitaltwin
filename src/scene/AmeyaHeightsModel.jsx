import { Component, Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import ProposedBuilding from './ProposedBuilding.jsx'

// ─── Ameya Heights structural model slot ───
// Drop the architect's .glb at:  public/models/ameya_heights_structure.glb
// The moment the file exists, it replaces the procedural massing below —
// no code changes needed. Until then, the procedural podium+tower renders.
//
// BASE_URL-prefixed so the path survives relative deployment (base: './');
// in dev this resolves to exactly '/models/ameya_heights_structure.glb'.
const MODEL_URL = `${import.meta.env.BASE_URL}models/ameya_heights_structure.glb`

export default function AmeyaHeightsModel({ position = [-95, 0, 40], scale = 1, rotationY = 0 }) {
  const { scene } = useGLTF(MODEL_URL)

  // Full shadow participation: the model immediately interacts with the
  // live solar tracking (Environment.jsx sun) and environmental lighting.
  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])

  return <primitive object={scene} position={position} rotation={[0, rotationY, 0]} scale={scale} />
}

// Error boundary: a missing/corrupt GLB must never break the scene —
// it silently falls back to the procedural building.
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Drop-in site component used by Buildings.jsx: tries the GLB, shows the
// procedural massing while loading or whenever the file isn't there yet.
export function AmeyaHeightsSite({ position = [-95, 0, 40] }) {
  const fallback = <ProposedBuilding position={position} />
  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <AmeyaHeightsModel position={position} />
      </Suspense>
    </ModelBoundary>
  )
}
