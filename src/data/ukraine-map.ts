/**
 * A stylised map of Ukraine for the "makers map": a simplified border polygon
 * (longitude/latitude pairs, clockwise from the north-west) and one anchor point
 * per taxonomy region (its main city). Projected to a fixed SVG viewBox below.
 */

export const MAP_VIEWBOX = { width: 800, height: 540 } as const;

/** Simplified border, ~60 vertices — recognisable, not cartographically exact. */
export const UKRAINE_OUTLINE: [number, number][] = [
  [23.6, 51.5], [24.0, 51.9], [25.5, 51.95], [27.0, 51.75], [28.5, 51.55], [30.5, 51.5],
  [30.6, 51.3], [31.8, 52.1], [33.5, 52.35], [34.4, 51.75], [35.3, 51.05], [36.5, 50.3],
  [37.5, 50.4], [38.0, 49.9], [39.2, 49.8], [40.1, 49.6], [39.9, 48.9], [39.7, 48.0],
  [38.9, 47.85], [38.3, 47.1], [37.5, 47.1], [36.5, 46.7], [35.3, 46.8], [35.0, 46.2],
  [34.8, 45.9], [35.5, 45.3], [36.6, 45.4], [36.0, 45.0], [35.0, 44.7], [34.4, 44.4],
  [33.5, 44.4], [33.0, 45.0], [32.5, 45.4], [33.6, 45.9], [33.2, 46.1], [32.0, 46.3],
  [31.9, 46.6], [31.0, 46.6], [30.7, 46.4], [30.0, 45.9], [29.7, 45.3], [28.8, 45.3],
  [28.2, 45.5], [28.9, 46.5], [29.2, 47.4], [28.0, 48.2], [27.0, 48.4], [26.6, 48.2],
  [25.0, 47.75], [24.0, 47.95], [23.0, 48.0], [22.2, 48.4], [22.15, 48.2], [22.6, 49.1],
  [22.9, 49.8], [23.6, 50.4], [24.1, 50.9],
];

/** Anchor city per taxonomy region slug. */
export const REGION_POINTS: Record<string, { lon: number; lat: number }> = {
  kyiv: { lon: 30.52, lat: 50.45 },
  lviv: { lon: 24.03, lat: 49.84 },
  "ivano-frankivsk": { lon: 24.71, lat: 48.92 },
  zakarpattia: { lon: 22.29, lat: 48.62 },
  poltava: { lon: 34.55, lat: 49.59 },
  chernihiv: { lon: 31.29, lat: 51.5 },
  odesa: { lon: 30.73, lat: 46.48 },
  kharkiv: { lon: 36.23, lat: 49.99 },
  vinnytsia: { lon: 28.47, lat: 49.23 },
  dnipro: { lon: 35.05, lat: 48.46 },
};

const BOUNDS = { west: 22.0, east: 40.3, north: 52.5, south: 44.3 };
const PADDING = 24;
/** Equirectangular with the longitude axis shortened by cos(mid-latitude). */
const LAT_SCALE = 1 / Math.cos((48.4 * Math.PI) / 180);

export function project(lon: number, lat: number): { x: number; y: number } {
  const w = MAP_VIEWBOX.width - PADDING * 2;
  const h = MAP_VIEWBOX.height - PADDING * 2;
  const spanX = BOUNDS.east - BOUNDS.west;
  const spanY = (BOUNDS.north - BOUNDS.south) * LAT_SCALE;
  const scale = Math.min(w / spanX, h / spanY);
  const offsetX = PADDING + (w - spanX * scale) / 2;
  const offsetY = PADDING + (h - spanY * scale) / 2;
  return {
    x: Math.round((offsetX + (lon - BOUNDS.west) * scale) * 10) / 10,
    y: Math.round((offsetY + (BOUNDS.north - lat) * LAT_SCALE * scale) * 10) / 10,
  };
}

/** Smooth closed SVG path through the outline (Catmull-Rom → cubic Béziers). */
export function outlinePath(points: [number, number][] = UKRAINE_OUTLINE): string {
  const pts = points.map(([lon, lat]) => project(lon, lat));
  const n = pts.length;
  if (n < 3) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d + " Z";
}
