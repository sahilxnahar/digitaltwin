import { useEffect, useRef, useState } from 'react'
import { AERIAL_ADDRESS } from '../config.js'

// Google Aerial View API — pre-rendered cinematic 3D drone video overlay.
// Uses the primary Maps console key (VITE_GOOGLE_MAPS_KEY); the key must
// have the "Aerial View API" enabled in Google Cloud Console.
//
// States: LOADING → fetching metadata · PROCESSING → Google is still
// rendering the video · ERROR → no key / no video / network failure ·
// SUCCESS → autoplaying looped MP4.

const DEFAULT_ADDRESS = AERIAL_ADDRESS
const LOOKUP_URL = 'https://aerialview.googleapis.com/v1/videos:lookupVideo'

export default function AerialViewModal({ address = DEFAULT_ADDRESS, onClose }) {
  const [status, setStatus] = useState('LOADING')
  const [videoUri, setVideoUri] = useState(null)
  const [message, setMessage] = useState('')
  const [playing, setPlaying] = useState(true)
  const videoRef = useRef(null)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  // Esc closes the modal
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!key || key.startsWith('PASTE_')) {
      setStatus('ERROR')
      setMessage('No Google Maps key configured — set VITE_GOOGLE_MAPS_KEY in .env (Aerial View API must be enabled on the key).')
      return
    }
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setStatus('LOADING')
        const params = new URLSearchParams({ key, address })
        const res = await fetch(`${LOOKUP_URL}?${params.toString()}`, { signal: ctrl.signal })
        const json = await res.json().catch(() => null)

        if (!res.ok) {
          if (res.status === 404) {
            setStatus('ERROR')
            setMessage(
              'No aerial video exists for this address yet. Trigger one render via videos:renderVideo (or the API explorer), wait a few minutes, then reopen this view.'
            )
          } else {
            setStatus('ERROR')
            setMessage((json && json.error && json.error.message) || `Aerial View API error (HTTP ${res.status}).`)
          }
          return
        }

        if (json && json.state === 'PROCESSING') {
          setStatus('PROCESSING')
          setMessage('Google is still rendering this aerial video — usually a few minutes. Close and retry shortly.')
          return
        }

        const uri = json && json.uris && json.uris.MP4_MEDIUM && json.uris.MP4_MEDIUM.landscapeUri
        if (json && json.state === 'ACTIVE' && uri) {
          setVideoUri(uri)
          setStatus('SUCCESS')
        } else {
          setStatus('ERROR')
          setMessage('The API responded without a playable MP4 URI.')
        }
      } catch {
        if (!ctrl.signal.aborted) {
          setStatus('ERROR')
          setMessage('Network error while contacting the Aerial View API.')
        }
      }
    })()
    return () => ctrl.abort()
  }, [address])

  return (
    <div className="aerial-overlay" onClick={onClose}>
      <div className="aerial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aerial-head">
          <span className="title">AERIAL DRONE VIEW — {address.toUpperCase()}</span>
          <button className="close" onClick={onClose}>✕</button>
        </div>

        {status === 'LOADING' && <div className="aerial-status pulse">Contacting Aerial View API…</div>}

        {status === 'PROCESSING' && (
          <div className="aerial-status">
            <div className="pulse">RENDER IN PROGRESS</div>
            <div className="dim small">{message}</div>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="aerial-status">
            <div style={{ color: '#e8875a' }}>UNAVAILABLE</div>
            <div className="dim small">{message}</div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <video
            ref={videoRef}
            className="aerial-video"
            src={videoUri}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            onClick={togglePlay}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        )}

        <div className="aerial-foot">
          {status === 'SUCCESS' && (
            <button className="aerial-play" onClick={togglePlay}>{playing ? '❚❚ PAUSE' : '▶ PLAY'}</button>
          )}
          <div className="dim small aerial-credit">Imagery · Google Aerial View API</div>
        </div>
      </div>
    </div>
  )
}
