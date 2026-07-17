#!/usr/bin/env python3
"""
Prepare high-accuracy building footprints for the Ameya Heights digital twin.

Sources (free, attribution required):
  · VIDA combined Google/Microsoft building footprints:
    https://source.coop/repositories/vida/google-microsoft-open-buildings
  · Google Open Buildings v3 (+ 2.5D temporal heights):
    https://sites.research.google/open-buildings/

Usage:
  1. Download the tile/CSV covering your site (Karnataka / Tamil Nadu).
  2. pip install geopandas shapely pyarrow
  3. python scripts/prepare_footprints.py <input.(parquet|csv|geojson)> \
        --lat 12.9871 --lng 77.5250 --radius 800
  4. The script writes public/data/site_buildings.geojson — Real Site Mode
     automatically prefers this file over live OSM on next load.

Height: uses Open Buildings 2.5D 'height' column when present, else
estimates 6 m. Output schema matches the app: Feature.properties.height.
"""
import argparse, json, math, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('--lat', type=float, required=True)
    ap.add_argument('--lng', type=float, required=True)
    ap.add_argument('--radius', type=float, default=800, help='meters')
    ap.add_argument('--out', default='public/data/site_buildings.geojson')
    args = ap.parse_args()

    try:
        import geopandas as gpd
    except ImportError:
        sys.exit('pip install geopandas shapely pyarrow')

    print(f'reading {args.input} …')
    gdf = gpd.read_parquet(args.input) if args.input.endswith('.parquet') else gpd.read_file(args.input)
    gdf = gdf.to_crs(4326)

    dlat = args.radius / 110540
    dlng = args.radius / (111320 * math.cos(math.radians(args.lat)))
    box = (args.lng - dlng, args.lat - dlat, args.lng + dlng, args.lat + dlat)
    clip = gdf.cx[box[0]:box[2], box[1]:box[3]]
    print(f'{len(clip)} footprints within {args.radius} m')

    feats = []
    for _, row in clip.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue
        if geom.geom_type == 'MultiPolygon':
            geom = max(geom.geoms, key=lambda g: g.area)
        h = None
        for col in ('height', 'height_m', 'building_height'):
            if col in row and row[col] == row[col]:
                h = float(row[col]); break
        feats.append({
            'type': 'Feature',
            'properties': {'height': h or 6.0, 'name': None, 'kind': 'openbuildings'},
            'geometry': {'type': 'Polygon',
                         'coordinates': [list(map(list, geom.exterior.coords))]},
        })

    with open(args.out, 'w') as f:
        json.dump({'type': 'FeatureCollection', 'features': feats}, f)
    print(f'wrote {args.out} ({len(feats)} buildings) — Real Site Mode will use it automatically')

if __name__ == '__main__':
    main()
