import { useEffect } from 'react'
import { simState, schedulePresentationStep, stopPresentation, emitSimEvent } from '../state.js'

// Scripted, hands-free stakeholder fly-through.
// Timeline (all timeouts registered via schedulePresentationStep so that
// stopPresentation() — manual or natural — clears everything):
//
//   0s  macro view, high above Chennai, clean sim state, tower enabled
//   4s  deck.gl FlyTo eases down to the Chennai site (→ zoom 15+)
//   8s  hybrid LOD crossfade into the three.js micro sim (usually already
//       auto-triggered by the zoom threshold during the flight)
//  10s  Site Tour orbit engages around the proposed building
//  16s  'Construction' scenario — bottleneck builds on Poonamallee High Road
//  24s  reset to normal traffic, release the orbit, end of sequence
export default function PresentationMode({ active, setViewMode }) {
  useEffect(() => {
    if (!active) return

    // Step 1 (0s): macro overview + known-good sim state
    setViewMode('macro')
    simState.scenario = 'normal'
    simState.tourMode = false
    simState.showDevelopment = true // the tour needs the tower present
    emitSimEvent('simChanged')

    // Step 2 (4s): cinematic FlyTo down to the site
    schedulePresentationStep(() => emitSimEvent('flyToSite'), 4000)

    // Step 3 (8s): guarantee the LOD hand-off
    schedulePresentationStep(() => setViewMode('micro'), 8000)

    // Step 4 (10s): orbit the proposed building
    schedulePresentationStep(() => {
      simState.tourMode = true
      emitSimEvent('simChanged')
    }, 10000)

    // Step 5 (16s): construction bottleneck on Poonamallee High Road
    schedulePresentationStep(() => {
      simState.scenario = 'construction'
      emitSimEvent('simChanged')
    }, 16000)

    // Step 6 (24s): reset and end
    schedulePresentationStep(() => {
      simState.scenario = 'normal'
      simState.tourMode = false
      emitSimEvent('simChanged')
      stopPresentation()
    }, 24000)

    return () => {
      // Premature stop (or unmount): stopPresentation() has already cleared
      // the pending timeouts — restore a sane interactive state here.
      simState.tourMode = false
      simState.scenario = 'normal'
      emitSimEvent('simChanged')
    }
  }, [active, setViewMode])

  return null
}
