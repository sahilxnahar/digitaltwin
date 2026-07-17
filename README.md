# Ameya Heights — Multi-City 3D Digital Twin (Chennai · Bengaluru)

A premium, cinematic 3D digital twin for the Ameya Heights development in
Chennai, built with Vite + React + Three.js (`@react-three/fiber`, `drei`)
and a Deck.gl city-scale macro layer.

## Run

```bash
npm install
npm run dev
```

Works immediately in demo mode with no keys. Copy `.env.example` to `.env`
and add keys for live data (see the checklist inside that file).

## Highlights

- Hybrid LOD: Deck.gl macro map of greater Chennai (Google 3D Tiles /
  Mapbox / Carto tiers) crossfading into a high-fidelity three.js site sim
- ~400 instanced vehicles with live TomTom congestion driving speed,
  density and color; working signals; VIP / Construction scenarios
- Live environment: Open-Meteo weather + AQI, real Chennai solar tracking,
  automatic rain mode with wet-road materials
- Ameya Heights site: procedural massing that auto-swaps for
  `public/models/ameya_heights_chennai_v1.glb` when present
- Presentation mode, cinematic site tour, aerial drone view modal,
  Neighborhood Discovery sidebar (Places + Distance Matrix, pure React
  overlays — no google.maps.Map instances)

## Deploy

See `DEPLOYMENT.md` for the GitHub Desktop → Vercel walkthrough,
`vercel.json` for SPA rewrites + immutable caching of the GLB.
