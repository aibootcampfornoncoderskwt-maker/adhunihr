// Regenerates src/data/recruitment-map.json from world-atlas + d3-geo:  node scripts/generate-recruitment-map.mjs
// The map is two panels at different scales inside one 960x460 picture: the GCC (left, larger scale) and the source countries (right).
import { readFileSync, writeFileSync } from 'node:fs';
import { geoMercator, geoPath, geoBounds } from 'd3-geo';
import { feature } from 'topojson-client';

const W = 960, H = 460, SPLIT = 380;
const world = JSON.parse(readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const land = feature(world, world.objects.countries).features;
const sourceIds = new Set(['356', '144', '050', '524', '608']), gccIds = new Set(['414', '682', '784', '634', '048', '512']);
const kind = id => gccIds.has(id) ? 'gcc' : sourceIds.has(id) ? 'source' : '';

// Keeps the inlined SVG small: whole-pixel coordinates, dropping points closer than `min` px to the last one kept.
const thin = (d, min) => d.split('M').filter(Boolean).map(ring => {
  const pts = ring.replace(/Z/g, '').split('L').map(p => p.split(',').map(Number));
  const kept = [pts[0]];
  for (const p of pts.slice(1)) { const l = kept[kept.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= min) kept.push(p); }
  return kept.length < 3 ? '' : 'M' + kept.map(p => p.map(Math.round).join(',')).join('L') + 'Z';
}).join('');

function panel({ x0, x1, west, east, center, min, box }) {
  const width = x1 - x0;
  const projection = geoMercator().scale(width / ((east - west) * Math.PI / 180)).center(center).translate([x0 + width / 2, H / 2]).clipExtent([[x0 - 6, -6], [x1 + 6, H + 6]]);
  const path = geoPath(projection).digits(1);
  const shapes = land.filter(f => { const [[a, b], [c, d]] = geoBounds(f); return f.id !== '010' && c - a < 300 && c > box[0] && a < box[2] && d > box[1] && b < box[3]; })
    .map(f => ({ d: thin(path(f) || '', min), kind: kind(f.id) })).filter(s => s.d);
  return { shapes, point: ([lon, lat]) => projection([lon, lat]).map(v => +v.toFixed(1)) };
}

const gcc = panel({ x0: 0, x1: SPLIT, west: 43, east: 61, center: [52, 25], min: 1, box: [36, 8, 68, 40] });
const asia = panel({ x0: SPLIT, x1: W, west: 62, east: 130, center: [96, 18], min: 1.4, box: [55, -12, 138, 50] });

// Marker positions: national capitals for the GCC, country centres for the source countries.
const sources = { india: [78.5, 21.5], nepal: [84.1, 28.3], bangladesh: [90.3, 23.9], 'sri-lanka': [80.7, 7.8], philippines: [121.2, 15.5] };
const destinations = { kuwait: [47.98, 29.37], 'saudi-arabia': [46.7, 24.7], bahrain: [50.58, 26.2], qatar: [51.53, 25.29], uae: [54.4, 24.45], oman: [58.4, 23.6] };
const pts = (o, p) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, p.point(v)]));
const out = { width: W, height: H, split: SPLIT, gcc: gcc.shapes, asia: asia.shapes, sources: pts(sources, asia), destinations: pts(destinations, gcc) };
writeFileSync('src/data/recruitment-map.json', JSON.stringify(out));
console.log(out.gcc.length, out.asia.length, out.sources, out.destinations);
