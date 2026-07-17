import { useEffect, useState } from 'react'
import { CORRIDOR_VEH_PER_HR, PLACE_NAME, CITY, CITY_CFG } from '../config.js'
import { simState, subscribeEnvironment, onSimEvent, emitSimEvent, startPresentation, stopPresentation } from '../state.js'
import { aqiInfo } from '../services/EnvironmentAPI.js'
import AerialViewModal from './AerialViewModal.jsx'
import NeighborhoodDiscovery from './NeighborhoodDiscovery.jsx'
import EnquiryModal from './EnquiryModal.jsx'
import CitySwitcher from './CitySwitcher.jsx'
import SearchBar from './SearchBar.jsx'
import MapControls from './MapControls.jsx'
import PropertyFilters from './PropertyFilters.jsx'
import { useMapState, patchMapState } from '../mapStore.js'

const SCENARIOS = [
  { id: 'normal', label: 'Normal' },
  { id: 'vip', label: 'VIP Route' },
  { id: 'construction', label: 'Construction' },
]

const PROPOSED_ID = PLACE_NAME
const DEV_TELEMETRY = [
  ['typology', 'Semi-Commercial'],
  ['podium', '8m (Retail)'],
  ['tower', '46m (Office)'],
  ['est. traffic impact', '+4.2%'],
]

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function HUD({
  data, mode, setMode, simSpeed, setSimSpeed,
  cinematic, setCinematic, liveEnabled, setLiveEnabled,
  selected, setSelected, viewMode, setViewMode,
  envAuto, setEnvAuto, presenting,
}) {
  const [showAerial, setShowAerial] = useState(false)
  const mapSt = useMapState()
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [showEnquiry, setShowEnquiry] = useState(false)
  const [travelTime, setTravelTime] = useState(false)
  const toggleTravelTime = () => {
    setTravelTime((v) => !v)
    emitSimEvent('toggleIsochrones')
  }

  // Live environment (Open-Meteo, 15-min poll)
  const [env, setEnv] = useState(simState.environmentalData)
  useEffect(() => subscribeEnvironment((e) => setEnv({ ...e })), [])
  const aqi = aqiInfo(env.aqi)
  const t = data.traffic || {}
  const ratio = t.freeFlowSpeed > 0 ? t.currentSpeed / t.freeFlowSpeed : 1
  const score = t.roadClosure
    ? 12
    : Math.round(100 * (0.75 * Math.min(ratio, 1) + 0.25 * (t.confidence ?? 0.8)))
  const scoreColor = score >= 70 ? '#5ad67d' : score >= 45 ? '#e8c25a' : '#e86a5a'
  const delay = Math.max(0, Math.round((t.currentTravelTime ?? 0) - (t.freeFlowTravelTime ?? 0)))
  const co2 = Math.round(CORRIDOR_VEH_PER_HR * (delay / 3600) * 2.3)
  const pm25 = data.aqi?.pm25

  const [scenario, setScenarioState] = useState(simState.scenario)
  const setScenario = (id) => {
    simState.scenario = id // picked up by the vehicle sim on the next sub-step
    setScenarioState(id)
  }

  const [showDev, setShowDevState] = useState(simState.showDevelopment)
  const toggleDev = () => {
    simState.showDevelopment = !simState.showDevelopment // picked up by Buildings on the next frame
    setShowDevState(simState.showDevelopment)
  }

  const [tour, setTourState] = useState(simState.tourMode)
  const toggleTour = () => {
    simState.tourMode = !simState.tourMode // picked up by the CameraTour rig next frame
    setTourState(simState.tourMode)
  }

  // Re-sync mirrored toggles when the presentation sequencer drives simState
  useEffect(
    () =>
      onSimEvent((type) => {
        if (type !== 'simChanged') return
        setScenarioState(simState.scenario)
        setShowDevState(simState.showDevelopment)
        setTourState(simState.tourMode)
      }),
    []
  )

  const Btn = ({ on, onClick, children }) => (
    <button className={on ? 'on' : ''} onClick={onClick}>{children}</button>
  )

  return (
    <div className="hud">
      <CitySwitcher />
      <SearchBar viewMode={viewMode} setViewMode={setViewMode} />
      {data.source === 'demo' && (
        <div className="banner">Showing demo data — add your API key for live data</div>
      )}

      <div className="panel top-left">
        <div className="title">{PLACE_NAME.toUpperCase()} · {CITY.toUpperCase()} — DIGITAL TWIN</div>

        {/* ── Live Environment widget (Open-Meteo) ── */}
        <div className="env-row">
          <span>{env.temp != null ? `${Math.round(env.temp)}°C` : '—°C'}</span>
          <span style={{ color: aqi.color }}>
            AQI {env.aqi != null ? Math.round(env.aqi) : '—'} · {aqi.label}
          </span>
          {env.isRaining && <span className="rain-chip">RAIN</span>}
        </div>
        <div className="dim small" style={{ marginTop: 0, marginBottom: 6 }}>
          live environment · {env.lastUpdate ? `updated ${fmtTime(env.lastUpdate)}` : 'fetching…'}
          {envAuto ? ' · auto' : ' · manual override'}
        </div>
        <div className="score-row">
          <span className="score" style={{ color: scoreColor }}>{score}</span>
          <span className="dim">/100 corridor health</span>
        </div>
        <div className="stat">flow&nbsp;&nbsp;&nbsp;{t.currentSpeed} km/h <span className="dim">/ {t.freeFlowSpeed} free-flow</span></div>
        <div className="stat">delay&nbsp;&nbsp;+{delay}s <span className="dim">per segment</span></div>
        <div className="stat">co₂&nbsp;&nbsp;&nbsp;&nbsp;≈{co2} kg/hr excess <span className="dim">(modelled estimate)</span></div>
        <div className="stat">pm2.5&nbsp;&nbsp;{pm25} µg/m³ <span className="dim">({data.aqiSource === 'live' ? 'live · CPCB' : 'demo'})</span></div>
        <div className="dim small">
          {data.source === 'live' ? 'LIVE · TomTom flow' : 'DEMO data'} · updated {fmtTime(data.updatedAt)}
          <br />click a landmark for detail · drag to orbit
        </div>
      </div>

      <div className="panel present">
        <button
          className={presenting ? 'present-btn active' : 'present-btn'}
          onClick={() => (presenting ? stopPresentation() : startPresentation())}
        >
          {presenting ? '⏹ STOP PRESENTATION' : '▶ START PRESENTATION'}
        </button>
        {presenting && <div className="dim small">cinematic sequence running · camera locked</div>}
        <button className="aerial-btn" onClick={() => setShowAerial(true)}>🚁 AERIAL DRONE VIEW</button>
        <button className="aerial-btn disc-toggle" onClick={() => setShowDiscovery((v) => !v)}>
          📍 NEIGHBORHOOD DISCOVERY
        </button>
        <button className="aerial-btn enq-toggle" onClick={() => setShowEnquiry(true)}>✉ ENQUIRE NOW</button>
      </div>

      {showAerial && <AerialViewModal onClose={() => setShowAerial(false)} />}
      {showDiscovery && <NeighborhoodDiscovery onClose={() => setShowDiscovery(false)} />}
      {showEnquiry && <EnquiryModal onClose={() => setShowEnquiry(false)} />}
      {viewMode === 'macro' && <MapControls />}
      {viewMode === 'micro' && <PropertyFilters />}

      <div className="panel controls">
        {/* hybrid LOD toggle */}
        <Btn on={viewMode === 'macro'} onClick={() => setViewMode('macro')}>City View</Btn>
        <Btn on={viewMode === 'micro'} onClick={() => setViewMode('micro')}>Site View</Btn>
        {viewMode === 'macro' && (
          <>
            <Btn on={travelTime} onClick={toggleTravelTime}>⏱ Travel Time</Btn>
            <span className="dim small" style={{ margin: '0 4px' }}>{CITY_CFG.hint}</span>
          </>
        )}
        {viewMode === 'micro' && (
          <>
            <span className="sep" />
            <span className="dim label">overrides</span>
            <Btn on={envAuto} onClick={() => setEnvAuto(true)}>Auto</Btn>
            <Btn on={!envAuto && mode === 'day'} onClick={() => setMode('day')}>Day</Btn>
            <Btn on={!envAuto && mode === 'night'} onClick={() => setMode('night')}>Night</Btn>
            <Btn on={!envAuto && mode === 'rain'} onClick={() => setMode('rain')}>Rain</Btn>
            <span className="sep" />
            {[1, 10, 60].map((s) => (
              <Btn key={s} on={simSpeed === s} onClick={() => setSimSpeed(s)}>{s}×</Btn>
            ))}
            <span className="sep" />
            <Btn on={cinematic} onClick={() => setCinematic(!cinematic)}>Cinematic</Btn>
            <Btn on={liveEnabled} onClick={() => setLiveEnabled(!liveEnabled)}>
              {liveEnabled ? 'LIVE' : 'DEMO'}
            </Btn>
            <span className="sep" />
            <span className="dim label">scenario</span>
            {SCENARIOS.map((s) => (
              <Btn key={s.id} on={scenario === s.id} onClick={() => setScenario(s.id)}>{s.label}</Btn>
            ))}
            <span className="sep" />
            <Btn on={showDev} onClick={toggleDev}>Proposed Site</Btn>
            <Btn on={tour} onClick={toggleTour}>Site Tour</Btn>
            <Btn on={mapSt.siteMode === 'real'} onClick={() => patchMapState({ siteMode: mapSt.siteMode === 'real' ? 'stylized' : 'real' })}>
              Real Site
            </Btn>
          </>
        )}
      </div>

      {selected && (
        <div className="panel detail">
          <div className="detail-head">
            <span className={selected === PROPOSED_ID ? 'title serif-title' : 'title'}>{selected}</span>
            <button className="close" onClick={() => setSelected(null)}>✕</button>
          </div>
          {selected === PROPOSED_ID && (
            <>
              <div className="dim small" style={{ margin: '2px 0 4px', letterSpacing: '0.08em' }}>
                DEVELOPMENT TELEMETRY
              </div>
              <table>
                <tbody>
                  {DEV_TELEMETRY.map(([k, v]) => (
                    <tr key={k}><td className="dim">{k}</td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '8px 0' }} />
              <div className="dim small" style={{ margin: '0 0 4px', letterSpacing: '0.08em' }}>
                CORRIDOR CONDITIONS
              </div>
            </>
          )}
          <table>
            <tbody>
              <tr><td className="dim">speed now</td><td>{t.currentSpeed} km/h</td></tr>
              <tr><td className="dim">normal (free-flow)</td><td>{t.freeFlowSpeed} km/h</td></tr>
              <tr><td className="dim">travel time now</td><td>{t.currentTravelTime}s</td></tr>
              <tr><td className="dim">normal travel time</td><td>{t.freeFlowTravelTime}s</td></tr>
              <tr><td className="dim">confidence</td><td>{Math.round((t.confidence ?? 0) * 100)}%</td></tr>
              <tr><td className="dim">road closure</td><td>{t.roadClosure ? 'YES' : 'no'}</td></tr>
              <tr><td className="dim">pm2.5</td><td>{pm25} µg/m³</td></tr>
              <tr><td className="dim">source</td><td>{data.source === 'live' ? 'TomTom live' : 'demo (baked)'}</td></tr>
            </tbody>
          </table>
          <div className="dim small">nearest measured segment to {PLACE_NAME} · refreshes every 60s</div>
        </div>
      )}
    </div>
  )
}
