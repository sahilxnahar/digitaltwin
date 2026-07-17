import { useEffect, useRef, useState } from 'react'
import { PLACE_LAT, PLACE_LNG } from '../config.js'
import { loadGoogleMaps } from '../services/googleMaps.js'

// Neighborhood Discovery sidebar — 100% React DOM overlay.
// Uses PlacesService bound to a DETACHED div (no map, no markers, no
// InfoWindows) so the Deck.gl / three.js canvases are never touched.

const SITE = { lat: PLACE_LAT, lng: PLACE_LNG } // Ameya Heights site origin
const RADIUS_M = 1600

const CATEGORIES = [
  { id: 'transit_station', label: 'Transit' },
  { id: 'cafe', label: 'Cafés' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'school', label: 'Schools' },
  { id: 'hospital', label: 'Health' },
]

const stars = (r) => (Number.isFinite(r) ? `★ ${r.toFixed(1)}` : '★ —')

export default function NeighborhoodDiscovery({ onClose }) {
  const [status, setStatus] = useState('LOADING')
  const [error, setError] = useState('')
  const [category, setCategory] = useState('transit_station')
  const [places, setPlaces] = useState([])
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const svc = useRef(null)

  // ── Nearby search (list view) ──
  useEffect(() => {
    let cancelled = false
    setStatus('LOADING')
    setError('')
    loadGoogleMaps()
      .then((google) => {
        if (cancelled) return
        if (!svc.current) {
          svc.current = new google.maps.places.PlacesService(document.createElement('div'))
        }
        svc.current.nearbySearch({ location: SITE, radius: RADIUS_M, type: category }, (results, st) => {
          if (cancelled) return
          const S = google.maps.places.PlacesServiceStatus
          if (st === S.OK && Array.isArray(results)) {
            setPlaces(
              results.slice(0, 9).map((r) => ({
                id: r.place_id,
                name: r.name,
                rating: r.rating,
                total: r.user_ratings_total,
                vicinity: r.vicinity,
              }))
            )
            setStatus('READY')
          } else if (st === S.ZERO_RESULTS) {
            setPlaces([])
            setStatus('READY')
          } else {
            setError(`Places search failed (${st}).`)
            setStatus('ERROR')
          }
        })
      })
      .catch(() => {
        if (!cancelled) {
          setError('Google Maps JS could not load — check VITE_GOOGLE_MAPS_KEY and enable "Maps JavaScript API" + "Places API" on the key.')
          setStatus('ERROR')
        }
      })
    return () => {
      cancelled = true
    }
  }, [category])

  // ── Detail view: Place Details + Distance Matrix ──
  const openDetail = (p) => {
    setSelected(p)
    setView('detail')
    setDetail({ status: 'LOADING' })

    loadGoogleMaps()
      .then((google) => {
        const out = { status: 'READY', details: null, driving: null, walking: null }
        const S = google.maps.places.PlacesServiceStatus
        const push = () => setDetail({ ...out })

        // Place Details (name, address, rating, reviews, photos)
        svc.current.getDetails(
          { placeId: p.id, fields: ['name', 'formatted_address', 'rating', 'reviews', 'photos'] },
          (d, st) => {
            if (st === S.OK && d) {
              let photo = null
              try {
                photo = d.photos && d.photos[0] ? d.photos[0].getUrl({ maxWidth: 640, maxHeight: 400 }) : null
              } catch {
                photo = null
              }
              out.details = {
                name: d.name || p.name,
                address: d.formatted_address || p.vicinity || '',
                rating: d.rating,
                photo,
                reviews: (d.reviews || []).slice(0, 2).map((r) => ({
                  author: r.author_name || 'Reviewer',
                  rating: r.rating,
                  text: (r.text || '').slice(0, 170),
                })),
              }
            }
            push()
          }
        )

        // Distance Matrix — origin strictly the Ameya Heights site
        const dm = new google.maps.DistanceMatrixService()
        const ask = (mode, slot) =>
          new Promise((res) => {
            dm.getDistanceMatrix(
              { origins: [SITE], destinations: [{ placeId: p.id }], travelMode: mode },
              (resp, st) => {
                if (st === 'OK') {
                  const el = resp && resp.rows && resp.rows[0] && resp.rows[0].elements && resp.rows[0].elements[0]
                  if (el && el.status === 'OK') {
                    out[slot] = { dist: el.distance && el.distance.text, time: el.duration && el.duration.text }
                  }
                }
                res()
              }
            )
          })
        Promise.all([
          ask(google.maps.TravelMode.DRIVING, 'driving'),
          ask(google.maps.TravelMode.WALKING, 'walking'),
        ]).then(push)
      })
      .catch(() => setDetail({ status: 'ERROR' }))
  }

  const backToList = () => {
    setView('list')
    setSelected(null)
    setDetail(null)
  }

  return (
    <div className="discovery-sidebar">
      <div className="disc-head">
        <span className="serif-title">NEIGHBORHOOD DISCOVERY</span>
        <button className="close" onClick={onClose}>✕</button>
      </div>
      <div className="dim small disc-sub">around Ameya Heights · Basaveshwar Nagar · {RADIUS_M / 1000} km radius</div>

      {view === 'list' && (
        <>
          <div className="disc-cats">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={category === c.id ? 'on' : ''} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="disc-list">
            {status === 'LOADING' && <div className="disc-status pulse">Searching nearby places…</div>}
            {status === 'ERROR' && <div className="disc-status dim">{error}</div>}
            {status === 'READY' && places.length === 0 && (
              <div className="disc-status dim">No results in this category nearby.</div>
            )}
            {status === 'READY' &&
              places.map((p) => (
                <div key={p.id} className="disc-item">
                  <div>
                    <div className="serif-title disc-name">{p.name}</div>
                    <div className="dim small">
                      {stars(p.rating)}
                      {p.total ? ` (${p.total})` : ''} · {p.vicinity || ''}
                    </div>
                  </div>
                  <button onClick={() => openDetail(p)}>Show Details</button>
                </div>
              ))}
          </div>
        </>
      )}

      {view === 'detail' && (
        <div className="disc-detail">
          <button className="disc-back" onClick={backToList}>← Back to List</button>

          {(!detail || detail.status === 'LOADING') && <div className="disc-status pulse">Fetching details…</div>}
          {detail && detail.status === 'ERROR' && (
            <div className="disc-status dim">Could not load details for this place.</div>
          )}

          {detail && detail.status === 'READY' && (
            <>
              {detail.details && detail.details.photo && (
                <img className="disc-photo" src={detail.details.photo} alt={detail.details.name} onError={(e) => (e.target.style.display = 'none')} />
              )}
              <div className="serif-title disc-detail-name">{(detail.details && detail.details.name) || (selected && selected.name)}</div>
              <div className="dim small">{detail.details && detail.details.address}</div>
              {detail.details && Number.isFinite(detail.details.rating) && (
                <div className="disc-rating">{stars(detail.details.rating)}</div>
              )}

              <div className="disc-matrix">
                <div className="dim small label">FROM AMEYA HEIGHTS</div>
                <div className="disc-matrix-row">
                  <span className="dim">driving</span>
                  <span>{detail.driving ? `${detail.driving.dist} · ${detail.driving.time}` : '—'}</span>
                </div>
                <div className="disc-matrix-row">
                  <span className="dim">walking</span>
                  <span>{detail.walking ? `${detail.walking.dist} · ${detail.walking.time}` : '—'}</span>
                </div>
              </div>

              {detail.details && detail.details.reviews && detail.details.reviews.length > 0 && (
                <div className="disc-reviews">
                  <div className="dim small label">REVIEWS</div>
                  {detail.details.reviews.map((r, i) => (
                    <div key={i} className="disc-review">
                      <div className="small">
                        <span className="serif-title">{r.author}</span> <span className="dim">{stars(r.rating)}</span>
                      </div>
                      <div className="dim small">"{r.text}…"</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="dim small disc-credit">Data · Google Places</div>
    </div>
  )
}
