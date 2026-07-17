import { useRef } from 'react'
import * as THREE from 'three'
import { emitSimEvent } from '../state.js'

// On-screen navigation: Zoom In / Zoom Out / Reset View.
// Works in both LOD contexts — three.js OrbitControls in Site View
// (smooth rAF tweens) and the deck.gl camera in City View (sim events
// picked up by GeospatialMap, answered with FlyTo transitions).

const HOME_POS = new THREE.Vector3(140, 55, 185)
const HOME_TARGET = new THREE.Vector3(0, 4, 0)
const MIN_DIST = 32
const MAX_DIST = 420
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

export default function NavigationControls({ viewMode, controlsRef }) {
  const anim = useRef(null)

  const tween = (cam, controls, toPos, toTarget, ms = 500) => {
    if (anim.current) cancelAnimationFrame(anim.current)
    const fromPos = cam.position.clone()
    const fromTarget = controls.target.clone()
    const start = performance.now()
    const step = (now) => {
      const k = easeOut(Math.min((now - start) / ms, 1))
      cam.position.lerpVectors(fromPos, toPos, k)
      controls.target.lerpVectors(fromTarget, toTarget, k)
      if (k < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }

  const zoom = (factor) => {
    if (viewMode === 'macro') {
      emitSimEvent(factor < 1 ? 'navZoomIn' : 'navZoomOut')
      return
    }
    const controls = controlsRef.current
    if (!controls) return
    const cam = controls.object
    const dir = cam.position.clone().sub(controls.target)
    const dist = THREE.MathUtils.clamp(dir.length() * factor, MIN_DIST, MAX_DIST)
    const toPos = controls.target.clone().add(dir.normalize().multiplyScalar(dist))
    tween(cam, controls, toPos, controls.target.clone(), 420)
  }

  const reset = () => {
    if (viewMode === 'macro') {
      emitSimEvent('navReset')
      return
    }
    const controls = controlsRef.current
    if (!controls) return
    tween(controls.object, controls, HOME_POS.clone(), HOME_TARGET.clone(), 850)
  }

  return (
    <div className="nav-controls">
      <button title="Zoom in" onClick={() => zoom(0.72)}>+</button>
      <button title="Zoom out" onClick={() => zoom(1.38)}>−</button>
      <button title="Reset view" className="nav-reset" onClick={reset}>⟲</button>
      <button title="Pause rotation" className="nav-reset" onClick={() => emitSimEvent('pauseRotation')}>⏸</button>
    </div>
  )
}
