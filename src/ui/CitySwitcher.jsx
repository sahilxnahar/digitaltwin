import { CITIES, getActiveCityId, switchCity } from '../cities.js'

// Top-center city tabs — persists the choice and reloads so every module
// re-anchors (coords, arterials, signage, model, live feeds).
export default function CitySwitcher() {
  const active = getActiveCityId()
  return (
    <div className="city-tabs">
      {Object.values(CITIES).map((c) => (
        <button
          key={c.id}
          className={active === c.id ? 'on' : ''}
          onClick={() => switchCity(c.id)}
        >
          {c.city.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
