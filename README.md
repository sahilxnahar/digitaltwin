# Vasanth Nagar · Bengaluru — 3D Digital Twin

A stylized-realistic, cinematic 3D digital twin of Vasanth Nagar (Bengaluru) built with
**Vite + React + Three.js** (`three`, `@react-three/fiber`, `@react-three/drei`,
`@react-three/postprocessing`). ~1,300 instanced vehicles (cars, autos, buses,
two-wheelers) flow through a stylized recreation of the Cunningham Road / Millers Road /
Queens Road grid, queue at working traffic signals, and respond to **live TomTom traffic
flow** for the area — with a fully-working baked **demo mode** whenever no key or network
is available.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173). That's it — the app works
immediately in demo mode even with no API keys and no network.

> If your npm version complains about peer dependencies, use
> `npm install --legacy-peer-deps`.

## Live data (optional)

Copy `.env.example` to `.env` and add keys:

```
VITE_TOMTOM_KEY=your_tomtom_key        # https://developer.tomtom.com (free tier)
VITE_DATA_GOV_KEY=your_data_gov_key    # https://data.gov.in (live PM2.5, optional)
```

Every 60 s the app fetches TomTom flow-segment data
(`currentSpeed`, `freeFlowSpeed`, `currentTravelTime`, `confidence`, `roadClosure`) for
Vasanth Nagar and uses `currentSpeed / freeFlowSpeed` to drive vehicle speeds and the
congestion glow color on the arterials. **Any failure silently falls back to demo mode**
(banner appears); a network failure never breaks the scene. Live payloads are ephemeral —
fetched, rendered, discarded.

⚠️ A `.env` with keys is included for convenience but is git-ignored. Treat API keys as
secrets — if a key has ever been shared in plain text (e.g. pasted in a chat), rotate it.

## Controls

- **Drag / scroll** — damped orbit & zoom (never top-down; polar angle is clamped)
- **Cinematic** — slow automatic orbit
- **Day / Night / Rain** — golden-hour sun, lit streetlights + window glow + stronger
  bloom, or particle rain with wet reflective roads and overcast light
- **1× / 10× / 60×** — simulation speed
- **LIVE / DEMO** — toggle live fetching
- **Click** Mount Carmel College, Sigma Mall, or the Vasanth Nagar park — opens a
  live-vs-normal detail panel

## HUD

Corridor health score (0–100, derived from speed ratio × confidence), flow vs free-flow
speed, segment delay, excess CO₂ (**clearly a modelled estimate**: assumed corridor
throughput × delay × idle-emission factor), and PM2.5.

## Tuning

Named constants at the top of `src/config.js`: `BLOOM_INTENSITY_*`, `SUN_ELEVATION_DEG`,
`SUN_AZIMUTH_DEG`, `FOG_DENSITY_*`, `VEHICLE_COUNTS`, place name/coords. To build a twin
of a different place, change `CITY`, `PLACE_NAME`, `PLACE_LAT/LNG` and reshape the grid
in `src/paths.js`.

## How it works

| File | Role |
| --- | --- |
| `src/paths.js` | Stylized road grid, junctions, closed lane splines (sampled CatmullRom), signal stop-points |
| `src/scene/Vehicles.jsx` | 4 `InstancedMesh` types, per-instance colors, sub-stepped car-following + red-light queueing |
| `src/scene/Ground.jsx` | Roads, lane dashes, zebra crossings, pavements, congestion glow strips |
| `src/scene/Buildings.jsx` | ~320 instanced buildings (emissive window texture), clickable landmarks, signage |
| `src/scene/Lighting.jsx` | Golden-hour sun + PCFSoft shadows, hemisphere light, fog, sky/stars per mode |
| `src/scene/Effects.jsx` | Bloom, N8AO ambient occlusion, gentle DoF on the place, vignette + warm grade |
| `src/hooks/useLiveData.js` | TomTom + data.gov.in fetch, null-guarded parsing, silent demo fallback |
| `src/ui/HUD.jsx` | Dark monospace docked HUD, controls, detail panel |

Rendering uses `ACESFilmicToneMapping`, sRGB output, and `MeshStandardMaterial`
throughout. Everything heavy is instanced; target is 60 fps with ~1,300 moving vehicles.
