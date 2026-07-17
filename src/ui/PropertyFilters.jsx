import { useState } from 'react'
import { useMapState, patchMapState } from '../mapStore.js'

// Site View real-estate filtration: floor counts + land-use categories.
// Government buildings render permanently red in the 3D scene regardless
// of any filter (strict visual override, applied in Buildings.jsx).

const FLOORS = [3, 4, 5]
const CATEGORIES = [
  { id: 'apartment', label: 'Apartments' },
  { id: 'plotted', label: 'Plotted Dev' },
  { id: 'empty', label: 'Empty Plots' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'government', label: 'Government' },
]

export default function PropertyFilters() {
  const [open, setOpen] = useState(false)
  const ms = useMapState()
  const f = ms.filters

  const setFloors = (n) => patchMapState({ filters: { ...f, floors: f.floors === n ? null : n } })
  const setCat = (c) => patchMapState({ filters: { ...f, category: f.category === c ? null : c } })

  return (
    <div className="map-controls">
      <button className={open ? 'aerial-btn on' : 'aerial-btn'} onClick={() => setOpen(!open)}>
        ⌂ PROPERTY FILTERS
      </button>
      {open && (
        <div className="panel map-panel">
          <div className="serif-title">PROPERTY FILTERS</div>

          <div className="dim small label">floor count</div>
          <div className="map-row">
            {FLOORS.map((n) => (
              <button key={n} className={f.floors === n ? 'on' : ''} onClick={() => setFloors(n)}>{n} floors</button>
            ))}
            <button className={!f.floors ? 'on' : ''} onClick={() => patchMapState({ filters: { ...f, floors: null } })}>All</button>
          </div>

          <div className="dim small label">land use</div>
          <div className="map-row wrap">
            {CATEGORIES.map((c) => (
              <button key={c.id} className={f.category === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
            <button className={!f.category ? 'on' : ''} onClick={() => patchMapState({ filters: { ...f, category: null } })}>All</button>
          </div>

          <div className="dim small" style={{ marginTop: 6 }}>
            <span style={{ color: '#e05a4e' }}>■</span> government buildings always render red ·
            non-matching structures dim to grey
          </div>
        </div>
      )}
    </div>
  )
}
