# Deploying Ameya Heights Digital Twin — GitHub Desktop → Vercel

## 0. Before you commit (GitHub Desktop)

1. Open GitHub Desktop → your repository → **Changes** tab.
2. Confirm `.env` is **NOT** in the list of files to be committed. It is
   git-ignored (see `.gitignore`) — only `.env.example` (blank keys) should
   appear. If you ever see `.env` listed, do not commit; fix `.gitignore` first.
3. Commit and push to GitHub (`Publish repository` / `Push origin`).

## 1. Vercel project setup — where the env vars go (click-by-click)

1. Go to https://vercel.com → log in → **Add New… → Project**.
2. Under "Import Git Repository", find your repo and click **Import**.
3. On the **Configure Project** screen:
   - Framework Preset: Vercel auto-detects **Vite** — leave it.
   - Build Command: `npm run build` (auto-filled) — leave it.
   - Output Directory: `dist` (auto-filled) — leave it.
4. **BEFORE clicking Deploy**, expand the **Environment Variables** section
   on that same Configure Project screen. Add each variable one at a time:

   | Name (Key field)       | Value (Value field)          |
   |------------------------|------------------------------|
   | `VITE_GOOGLE_MAPS_KEY` | your Google Maps key         |
   | `VITE_TOMTOM_KEY`      | your TomTom key              |
   | `VITE_MAPBOX_KEY`      | your Mapbox pk.… token       |
   | `VITE_DATA_GOV_KEY`    | your data.gov.in key (opt.)  |

   Type the name, paste the value, click **Add**. Repeat for all keys.
   Leave the environment scope at the default (All Environments).
5. Now click **Deploy**. Vite reads `VITE_*` variables **at build time**,
   which is why they must exist before the first build runs.

### Adding/changing keys after the first deploy
Project → **Settings** tab → **Environment Variables** (left menu) →
add or edit → then go to **Deployments** tab → ⋯ menu on the latest
deployment → **Redeploy**. (Env changes only take effect on a new build.)

## 2. `vercel.json` (already in the repo root)

- SPA rewrite: every route serves `index.html`, so refreshing the page on
  the live site never 404s. (Real static files still take precedence.)
- Long-lived immutable caching for `/models/ameya_heights_structure.glb`,
  everything in `/models/` and `/assets/`, and other heavy media
  (glb/gltf/hdr/ktx2/images/mp4/fonts) — repeat visits skip the downloads.
- If you ever replace the GLB with a new version, rename the file
  (e.g. `…_v2.glb`) and update `src/scene/AmeyaHeightsModel.jsx`, because
  the old name may be cached for up to a year.

## 3. `package.json` pre-commit checklist

Open `package.json` and confirm:

- `"scripts"` contains `"build": "vite build"` — this is exactly what
  Vercel runs. (It does; also `"dev": "vite"`, `"preview": "vite preview"`.)
- `vite` and `@vitejs/plugin-react` are present in `devDependencies` —
  Vercel installs BOTH dependencies and devDependencies, so this works.
- All runtime libs (`three`, `deck.gl`, `mapbox-gl`, `maplibre-gl`,
  `react-map-gl`, `@react-three/*`, `postprocessing`, `n8ao`) are in
  `dependencies`, not devDependencies.
- No `"engines"` field pinning an old Node — absent is fine (Vercel uses
  a current LTS).
- Final check before committing: run `npm run build` locally. If it prints
  `✓ built in …s` and produces a `dist/` folder, Vercel will succeed with
  the identical command.

## 4. After go-live: lock your keys down

`VITE_*` values are baked into the public JS bundle — anyone can read them.
That is normal for client-side keys, but restrict them:

- **Google** (Cloud Console → Credentials → your key): set
  "Application restrictions → Websites" to your Vercel domain(s)
  (`your-app.vercel.app`, your custom domain), and keep only the needed
  APIs enabled (Maps JavaScript, Places, Distance Matrix, Map Tiles,
  Aerial View).
- **Mapbox** (account.mapbox.com → Tokens): add URL restrictions.
- **TomTom**: rotate the key if it has ever been shared in plain text,
  and restrict by domain in the developer portal if available.
