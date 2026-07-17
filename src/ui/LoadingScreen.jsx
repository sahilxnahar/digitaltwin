import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { onSimEvent } from '../state.js'
import { CITY_CFG, PLACE_NAME } from '../config.js'

// Full-screen premium loading overlay. Fades out once initial assets are in:
// hooked to the three.js DefaultLoadingManager AND the Google 3D Tiles
// onTilesetLoad signal ('tilesLoaded' sim event), with a minimum display
// time for elegance and a hard timeout so a slow tile stream can never
// hold the experience hostage.

const MIN_MS = 1600
const MAX_MS = 6000
const FADE_MS = 900

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const start = Date.now()
    let done = false
    let fadeTimer
    const finish = () => {
      if (done) return
      done = true
      const wait = Math.max(0, MIN_MS - (Date.now() - start))
      fadeTimer = setTimeout(() => {
        setProgress(1)
        setFading(true)
        setTimeout(() => setGone(true), FADE_MS)
      }, wait)
    }

    const lm = THREE.DefaultLoadingManager
    const prevOnLoad = lm.onLoad
    const prevOnProgress = lm.onProgress
    lm.onProgress = (url, loaded, total) => {
      setProgress(total ? loaded / total : 0)
      if (prevOnProgress) prevOnProgress(url, loaded, total)
    }
    lm.onLoad = () => {
      finish()
      if (prevOnLoad) prevOnLoad()
    }

    const unsub = onSimEvent((type) => type === 'tilesLoaded' && finish())
    const hardTimeout = setTimeout(finish, MAX_MS)

    return () => {
      clearTimeout(hardTimeout)
      clearTimeout(fadeTimer)
      unsub()
      lm.onLoad = prevOnLoad
      lm.onProgress = prevOnProgress
    }
  }, [])

  if (gone) return null

  return (
    <div className={fading ? 'loading-screen out' : 'loading-screen'}>
      <div className="loading-title">{PLACE_NAME.toUpperCase()}</div>
      <div className="loading-sub">{CITY_CFG.loadingSub}</div>
      <div className="loading-ring" />
      <div className="loading-bar">
        <div style={{ width: `${Math.round(Math.max(0.08, progress) * 100)}%` }} />
      </div>
    </div>
  )
}
