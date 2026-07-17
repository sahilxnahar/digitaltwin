import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import GeospatialMap from './scene/GeospatialMap.jsx'
import EnvironmentController from './scene/Environment.jsx'
import PresentationMode from './scene/PresentationMode.jsx'
import { subscribePresentation } from './state.js'
import Lighting from './scene/Lighting.jsx'
import Ground from './scene/Ground.jsx'
import Buildings from './scene/Buildings.jsx'
import Trees from './scene/Trees.jsx'
import StreetLights from './scene/StreetLights.jsx'
import TrafficSignals from './scene/TrafficSignals.jsx'
import Vehicles from './scene/Vehicles.jsx'
import Rain from './scene/Rain.jsx'
// NOTE: post-processing (Effects.jsx — Bloom/N8AO/DoF/Vignette) is fully
// disabled for this optimization pass. Re-import + re-add <Effects /> below
// to restore the cinematic pipeline once performance is acceptable.
import HUD from './ui/HUD.jsx'
import NavigationControls from './ui/NavigationControls.jsx'
import StreetLabels from './scene/StreetLabels.jsx'
import LoadingScreen from './ui/LoadingScreen.jsx'
import { useLiveData } from './hooks/useLiveData.js'
import { simState } from './state.js'

// ─── Cinematic site tour: slow orbit around the proposed plot at
// the Ameya Heights plot (−95, 40) — kept in sync with PLOT in Buildings.jsx ───
const TOUR_CENTER = new THREE.Vector3(-95, 0, 40)
const TOUR_TARGET = new THREE.Vector3(-95, 22, 40) // mid-tower focus
const TOUR_RADIUS = 95
const TOUR_HEIGHT = 46
const TOUR_SPEED = 0.12 // rad/s
const tmpPos = new THREE.Vector3()

function CameraTour({ controlsRef }) {
  const { camera } = useThree()
  const angle = useRef(0)
  const active = useRef(false)
  const prevAutoRotate = useRef(false)

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls) return
    const d = Math.min(delta, 0.05)

    if (simState.tourMode) {
      if (!active.current) {
        // engage: take over from wherever the camera currently is
        active.current = true
        prevAutoRotate.current = controls.autoRotate
        angle.current = Math.atan2(
          camera.position.x - TOUR_CENTER.x,
          camera.position.z - TOUR_CENTER.z
        )
        controls.enabled = false
      }
      controls.autoRotate = false // never fight the tour rig
      angle.current += d * TOUR_SPEED
      tmpPos.set(
        TOUR_CENTER.x + Math.sin(angle.current) * TOUR_RADIUS,
        TOUR_HEIGHT + Math.sin(angle.current * 0.5) * 9, // gentle vertical drift
        TOUR_CENTER.z + Math.cos(angle.current) * TOUR_RADIUS
      )
      // critically-damped-ish ease toward the orbit path → smooth engage
      camera.position.lerp(tmpPos, Math.min(1, d * 2.0))
      // ease the controls target onto the tower so hand-off back is seamless
      controls.target.lerp(TOUR_TARGET, Math.min(1, d * 2.4))
      camera.lookAt(controls.target)
    } else if (active.current) {
      // release: OrbitControls resumes from the current pose — no jump,
      // because its target was already eased onto the site
      active.current = false
      controls.autoRotate = prevAutoRotate.current
      controls.enabled = true
      controls.update()
    }
  })
  return null
}

// Crossfade mount helper: keeps a layer mounted through its fade-out so the
// macro map and the micro sim can hand off smoothly (hybrid LOD transition)
function useFadeLayer(show, ms = 650) {
  const [mounted, setMounted] = useState(show)
  const [visible, setVisible] = useState(show)
  useEffect(() => {
    if (show) {
      setMounted(true)
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const t = setTimeout(() => setMounted(false), ms)
    return () => clearTimeout(t)
  }, [show, ms])
  return [
    mounted,
    {
      opacity: visible ? 1 : 0,
      transition: `opacity ${ms}ms ease`,
      pointerEvents: show ? 'auto' : 'none',
    },
  ]
}

export default function App() {
  const [mode, setMode] = useState('day') // 'day' | 'night' | 'rain'
  const [envAuto, setEnvAuto] = useState(true) // live environment drives mode
  const [sunPos, setSunPos] = useState(null) // real Chennai sun position
  // Manual override: forces a mode and detaches the live-environment driver
  const forceMode = (m) => {
    setEnvAuto(false)
    setMode(m)
  }
  const [simSpeed, setSimSpeed] = useState(1)
  const [cinematic, setCinematic] = useState(false)
  const [liveEnabled, setLiveEnabled] = useState(true)
  const [selected, setSelected] = useState(null)
  const [viewMode, setViewMode] = useState(simState.viewMode) // 'macro' | 'micro'
  const [presenting, setPresenting] = useState(simState.isPresentationActive)
  useEffect(() => subscribePresentation(setPresenting), [])
  const controlsRef = useRef()
  const data = useLiveData(liveEnabled)

  const [macroMounted, macroStyle] = useFadeLayer(viewMode === 'macro')
  const [microMounted, microStyle] = useFadeLayer(viewMode === 'micro')

  useEffect(() => {
    simState.viewMode = viewMode
  }, [viewMode])

  useEffect(() => {
    simState.simSpeed = simSpeed
  }, [simSpeed])

  useEffect(() => {
    const t = data.traffic
    const ratio = t && t.freeFlowSpeed > 0 ? t.currentSpeed / t.freeFlowSpeed : 0.55
    simState.congestion = Math.min(Math.max(ratio, 0.15), 1.2)
  }, [data])

  return (
    <>
      <EnvironmentController enabled={envAuto} onModeChange={setMode} onSunChange={setSunPos} />
      <PresentationMode active={presenting} setViewMode={setViewMode} />

      {/* ── MACRO: city-scale deck.gl map (Hebbal → Whitefield) ── */}
      {macroMounted && (
        <div className="layer" style={macroStyle}>
          <GeospatialMap onEnterMicro={() => setViewMode('micro')} presenting={presenting} />
        </div>
      )}

      {/* ── MICRO: high-fidelity three.js site simulation ── */}
      {microMounted && (
        <div className="layer" style={microStyle}>
          <Canvas
            shadows
            dpr={1} // hard-clamped: render at exactly 1x regardless of Retina scale
            camera={{ position: [140, 55, 185], fov: 40, near: 0.5, far: 1400 }}
            gl={{
              antialias: false, // frame rate over edge smoothing
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
          >
            <Lighting mode={mode} sunPos={sunPos} />
            <Ground mode={mode} />
            <Buildings mode={mode} onSelect={setSelected} />
            <Trees />
            <StreetLights mode={mode} />
            <TrafficSignals />
            <StreetLabels />
            <Vehicles mode={mode} />
            {mode === 'rain' && <Rain />}
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enabled={!presenting} // camera locked during the presentation
              target={[0, 4, 0]}
              enableDamping
              dampingFactor={0.05} // interactions glide smoothly to a halt
              autoRotate={cinematic}
              autoRotateSpeed={0.5}
              minDistance={30}
              maxDistance={430}
              maxPolarAngle={Math.PI / 2 - 0.1} // camera can never clip below ground
            />
            <CameraTour controlsRef={controlsRef} />
            {/* <Effects mode={mode} /> — post-processing stripped: raw renderer output */}
          </Canvas>
        </div>
      )}
      <NavigationControls viewMode={viewMode} controlsRef={controlsRef} />
      <LoadingScreen />
      <HUD
        presenting={presenting}
        viewMode={viewMode}
        setViewMode={setViewMode}
        data={data}
        mode={mode}
        setMode={forceMode}
        envAuto={envAuto}
        setEnvAuto={setEnvAuto}
        simSpeed={simSpeed}
        setSimSpeed={setSimSpeed}
        cinematic={cinematic}
        setCinematic={setCinematic}
        liveEnabled={liveEnabled}
        setLiveEnabled={setLiveEnabled}
        selected={selected}
        setSelected={setSelected}
      />
    </>
  )
}
