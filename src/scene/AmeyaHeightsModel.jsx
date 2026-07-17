import { Component, Suspense, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import ProposedBuilding from './ProposedBuilding.jsx'
import { CITY_CFG } from '../config.js'

// ─── Ameya Heights structural model slot ───
// Drop the architect's .glb into public/models/ using the filename
// declared for each city in src/cities.js
// The moment the file exists it replaces the procedural massing — no code
// changes needed. If it's missing, corrupt, or slow, the app degrades
// gracefully to the procedural building. It can never hang the site.
const MODEL_URL = `${import.meta.env.BASE_URL}${CITY_CFG.model}` // per-city GLB (src/cities.js)
const PREFLIGHT_TIMEOUT_MS = 8000

function GltfStructure({ position, scale = 1, rotationY = 0 }) {
  const { scene } = useGLTF(MODEL_URL)

  // Full shadow participation: interacts with the live solar tracking
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

// Boundary for parse/GPU errors AFTER a successful download — logs once,
// falls back, never retries (retry loops are what froze the browser).
class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn(
      `[AmeyaHeights] 3D model at ${MODEL_URL} downloaded but failed to parse/render — ` +
        `showing procedural massing instead.`,
      err && err.message ? err.message : err
    )
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// Drop-in site component used by Buildings.jsx.
// ANTI-LAG STRATEGY: before the GLTF loader is ever invoked, a single
// aborted-after-8s HEAD preflight confirms the file actually exists.
//   · missing / 404 / timeout        → warn once, procedural fallback
//   · SPA rewrite serving index.html → detected via content-type, fallback
//   · file OK                        → Suspense-loaded GLTF (with boundary)
// The loader therefore never enters a fetch-fail retry loop, and the
// basemap + React UI always render normally.
export function AmeyaHeightsSite({ position = [-95, 0, 40] }) {
  const [availability, setAvailability] = useState('checking') // 'checking' | 'ok' | 'missing'

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), PREFLIGHT_TIMEOUT_MS)
    fetch(MODEL_URL, { method: 'HEAD', signal: ctrl.signal })
      .then((res) => {
        if (cancelled) return
        const type = res.headers.get('content-type') || ''
        // Vite dev servers and SPA rewrites answer missing files with
        // index.html (status 200) — that is NOT a model.
        if (res.ok && !type.includes('text/html')) {
          setAvailability('ok')
        } else {
          console.warn(
            `[AmeyaHeights] No 3D model found at ${MODEL_URL} (status ${res.status}, type "${type}"). ` +
              `Rendering procedural massing — drop the city model into public/models/ to enable it.`
          )
          setAvailability('missing')
        }
      })
      .catch(() => {
        if (cancelled) return
        console.warn(
          `[AmeyaHeights] Model preflight for ${MODEL_URL} failed or timed out after ${PREFLIGHT_TIMEOUT_MS}ms. ` +
            `Rendering procedural massing; the app continues normally.`
        )
        setAvailability('missing')
      })
    return () => {
      cancelled = true
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [])

  const fallback = <ProposedBuilding position={position} />

  // While checking (or confirmed missing) show the procedural massing —
  // the scene is always fully populated, never blocked on the network.
  if (availability !== 'ok') return fallback

  return (
    <ModelBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfStructure position={position} />
      </Suspense>
    </ModelBoundary>
  )
}

export default GltfStructure
