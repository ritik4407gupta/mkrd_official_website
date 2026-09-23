/**
 * The scene-side copy of the brand ramp.
 *
 * brand.css owns these for the DOM, but three.js materials cannot read CSS
 * custom properties, and reading them back through getComputedStyle at scene
 * build time is a layout-thrash for no benefit. They are duplicated here on
 * purpose, and the two lists must be changed together.
 */
export const BRAND = {
  brand: '#2E22E6',
  lift: '#7C71FF',
  soft: '#A79CFF',
  pale: '#C2BBFF',
  deep: '#1B1499',
  accent: '#E20207',
  accentLift: '#FF6B70',
  ink: '#0B0D24',
  inkDeep: '#06071A',
  ink850: '#101334',
  ink800: '#161A40',
  ink700: '#232A5E',
  steel: '#8E96C8',
  steelDark: '#4A5285',
  ok: '#4BD3A0',
  warn: '#E8A33D',
  /** hot end / melt colours — these are temperature, not brand */
  hot: '#FF8A3D',
  hotCore: '#FFD9A0',
} as const;
