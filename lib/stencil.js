// lib/stencil.js
// Threads of Joy pattern engine
// Family specific generators and thumbnails so catalog items render distinct geometry.

export const USERS = {
  julie: { label: 'Julie', color: '#f0b35a' },
  mom: { label: 'Mom', color: '#d9a5ff' },
  kim: { label: 'Kim', color: '#8fd3ff' },
}

export const SOURCES = [
  'Full Line Stencil',
  'Urban Elementz',
  'Fancy Creations',
  'Blocks / Corners',
  'Digital / Paper',
]

export const BLOCKS = {
  ohio: 'Ohio Star',
  churn: 'Churn Dash',
  star: 'Eight Point Star',
  cabin: 'Log Cabin',
}

export const MOTIFS = [
  'Baptist Fan',
  'Ribbon Candy',
  'Clamshell',
  'Leaf Chain',
  'Flying Geese',
  'Floral Vine',
  'Celtic Knot',
  'Feather Spine',
  'Art Deco Fan',
  'Star Cascade',
  'English Oak',
  'Argyle',
  'Pebble',
]

export const CATALOG = [
  preset('baptist-fan-wave', 'Baptist Fan Wave', 'border', 'baptistFan', 'Urban Elementz', ['border', 'traditional'], {
    repeat: 5, arcWidth: 98, arcHeight: 42,
  }),
  preset('flying-geese-border', 'Flying Geese Border', 'border', 'flyingGeese', 'Digital / Paper', ['border', 'geometric'], {
    repeat: 6, cellW: 94, cellH: 36,
  }),
  preset('floral-vine-scroll', 'Floral Vine Scroll', 'border', 'floralVine', 'Urban Elementz', ['border', 'romantic'], {
    repeat: 5, step: 118, amp: 26, leaf: 28,
  }),
  preset('celtic-knotwork-border', 'Celtic Knotwork Border', 'border', 'celticKnot', 'Digital / Paper', ['border', 'intricate'], {
    repeat: 5, cellW: 104, cellH: 34,
  }),
  preset('feather-spine-plume', 'Feather Spine Plume', 'border', 'featherSpine', 'Full Line Stencil', ['border', 'elegant'], {
    repeat: 5, step: 124, amp: 22, plume: 26,
  }),
  preset('art-deco-fan', 'Art Deco Fan', 'border', 'artDecoFan', 'Urban Elementz', ['border', 'modern'], {
    repeat: 5, arcWidth: 94, arcHeight: 38,
  }),
  preset('star-cascade-border', 'Star Cascade Border', 'border', 'starCascade', 'Digital / Paper', ['border', 'patriotic'], {
    repeat: 6, step: 92, peak: 34,
  }),
  preset('simple-ribbon-candy-border', 'Simple Ribbon Candy Border', 'border', 'ribbonCandy', 'Full Line Stencil', ['border', 'classic'], {
    repeat: 5, step: 118, amp: 34,
  }),
  preset('classic-clamshell', 'Classic Clamshell', 'edge', 'clamshell', 'Urban Elementz', ['edge', 'traditional'], {
    repeat: 8, radius: 46,
  }),
  preset('english-oak-edge-to-edge', 'English Oak Edge to Edge', 'edge', 'englishOak', 'Urban Elementz', ['edge', 'organic'], {
    repeat: 5, step: 148, amp: 22, leaf: 30,
  }),
  preset('argyle-lattice', 'Argyle Lattice', 'edge', 'argyle', 'Digital / Paper', ['edge', 'geometric'], {
    repeat: 6, cellW: 102, cellH: 56,
  }),
  preset('modern-pebble-stipple', 'Modern Pebble Stipple', 'edge', 'pebble', 'Full Line Stencil', ['edge', 'organic'], {
    repeat: 9, radius: 18,
  }),
]

function preset(id, name, layout, family, source, tags, defaults) {
  return { id, name, layout, family, source, tags, defaults, style: family }
}

const familyForMotif = {
  'Baptist Fan': 'baptistFan',
  'Ribbon Candy': 'ribbonCandy',
  'Clamshell': 'clamshell',
  'Leaf Chain': 'leafChain',
  'Flying Geese': 'flyingGeese',
  'Floral Vine': 'floralVine',
  'Celtic Knot': 'celticKnot',
  'Feather Spine': 'featherSpine',
  'Art Deco Fan': 'artDecoFan',
  'Star Cascade': 'starCascade',
  'English Oak': 'englishOak',
  Argyle: 'argyle',
  Pebble: 'pebble',
  Feathers: 'featherSpine',
  Floral: 'floralVine',
  Geometric: 'argyle',
  Stipple: 'pebble',
}

const FAMILY_GENERATORS = {
  baptistFan,
  clamshell,
  ribbonCandy,
  leafChain,
  flyingGeese,
  floralVine,
  celticKnot,
  featherSpine,
  artDecoFan,
  starCascade,
  englishOak,
  argyle,
  pebble,
}

const FAMILY_THUMBNAILS = {
  baptistFan: (p) => baptistFan({ ...p, repeat: 3, arcWidth: 42, arcHeight: 18 }),
  clamshell: (p) => clamshell({ ...p, repeat: 3, radius: 20 }),
  ribbonCandy: (p) => ribbonCandy({ ...p, repeat: 3, step: 52, amp: 15 }),
  leafChain: (p) => leafChain({ ...p, repeat: 3, width: 48, tipLength: 38, capHeight: 15 }),
  flyingGeese: (p) => flyingGeese({ ...p, repeat: 3, cellW: 44, cellH: 18 }),
  floralVine: (p) => floralVine({ ...p, repeat: 3, step: 52, amp: 12, leaf: 12 }),
  celticKnot: (p) => celticKnot({ ...p, repeat: 3, cellW: 52, cellH: 18 }),
  featherSpine: (p) => featherSpine({ ...p, repeat: 3, step: 54, amp: 10, plume: 11 }),
  artDecoFan: (p) => artDecoFan({ ...p, repeat: 3, arcWidth: 42, arcHeight: 16 }),
  starCascade: (p) => starCascade({ ...p, repeat: 4, step: 38, peak: 12 }),
  englishOak: (p) => englishOak({ ...p, repeat: 2, step: 88, amp: 12, leaf: 14 }),
  argyle: (p) => argyle({ ...p, repeat: 3, cellW: 48, cellH: 24 }),
  pebble: (p) => pebble({ ...p, repeat: 5, radius: 8 }),
}

export function generateSVG(params = {}) {
  const family = resolveFamily(params)
  const generator = FAMILY_GENERATORS[family] || ribbonCandy
  const width = canvasWidth(params)
  const height = canvasHeight(params)
  const path = generator(normalizeParams(params, family, width, height))
  const bridges = params.stencil === 'plastic' ? stencilBridges(width, height) : ''
  return wrapSVG(path, width, height, bridges)
}

export function thumbnailSVG(item = {}) {
  const family = item.family || resolveFamily(item)
  const generator = FAMILY_THUMBNAILS[family] || FAMILY_THUMBNAILS.ribbonCandy
  const path = generator(item.defaults || item)
  return wrapSVG(path, 180, 72, '', 3)
}

function resolveFamily(params) {
  if (params.family) return params.family
  if (params.presetId) {
    const preset = CATALOG.find((x) => x.id === params.presetId)
    if (preset) return preset.family
  }
  const motif = Array.isArray(params.motifs) ? params.motifs[0] : params.motif
  return familyForMotif[motif] || 'ribbonCandy'
}

function normalizeParams(params, family, width, height) {
  const preset = params.presetId ? CATALOG.find((x) => x.id === params.presetId) : null
  const defaults = preset?.defaults || {}
  const complexity = Number(params.complexity || 2)
  return {
    width,
    height,
    family,
    repeat: defaults.repeat || Math.max(4, Math.round(width / 120)),
    arcWidth: defaults.arcWidth || 96,
    arcHeight: defaults.arcHeight || 42,
    radius: defaults.radius || 44,
    step: defaults.step || 120,
    amp: defaults.amp || lerp(18, 38, complexity / 4),
    leaf: defaults.leaf || 24,
    plume: defaults.plume || 22,
    cellW: defaults.cellW || 100,
    cellH: defaults.cellH || 48,
    peak: defaults.peak || 28,
    widthMotif: defaults.width || 90,
    tipLength: defaults.tipLength || 100,
    capHeight: defaults.capHeight || 34,
    ...defaults,
    ...params,
  }
}

function canvasWidth(params) {
  const layout = params.layout || 'edge'
  if (layout === 'border') return 720
  if (layout === 'block') return 360
  return 960
}

function canvasHeight(params) {
  const layout = params.layout || 'edge'
  if (layout === 'border') return 140
  if (layout === 'block') return 360
  return 220
}

function wrapSVG(path, width, height, extra = '', strokeWidth = 4) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="white"/>
  <path d="${path}" fill="none" stroke="#111" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  ${extra}
</svg>`.trim()
}

function stencilBridges(width, height) {
  const y = height - 12
  return [0.18, 0.5, 0.82].map((t, i) => {
    const x = Math.round(width * t)
    return `<rect x="${x - 6}" y="${y}" width="12" height="6" rx="2" fill="#7c3aed" opacity="0.15"/>`
  }).join('')
}

function baptistFan({ repeat = 5, arcWidth = 98, arcHeight = 42, height = 140 }) {
  let x = 16
  const y = height - 18
  let d = `M ${x} ${y}`
  for (let i = 0; i < repeat; i++) {
    const nx = x + arcWidth
    const cx = x + arcWidth / 2
    d += ` Q ${cx} ${y - arcHeight} ${nx} ${y}`
    x = nx
  }
  return d
}

function clamshell({ repeat = 8, radius = 46, height = 220 }) {
  let x = 20
  const y = height - 24
  let d = `M ${x} ${y}`
  for (let i = 0; i < repeat; i++) {
    const nx = x + radius * 2
    d += ` A ${radius} ${radius} 0 0 1 ${nx} ${y}`
    x = nx
  }
  return d
}

function ribbonCandy({ repeat = 5, step = 118, amp = 34, height = 140 }) {
  let x = 16
  const mid = height / 2 + 4
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    const x1 = x + step / 2
    const x2 = x + step
    const y = i % 2 === 0 ? mid - amp : mid + amp
    d += ` C ${x + step * 0.18} ${mid} ${x1 - step * 0.2} ${y} ${x1} ${y}`
    d += ` C ${x1 + step * 0.2} ${y} ${x + step * 0.82} ${mid} ${x2} ${mid}`
    x = x2
  }
  return d
}

function leafChain({ repeat = 7, widthMotif = 90, tipLength = 100, capHeight = 34, height = 220 }) {
  let x = 18
  const shoulderY = height / 2
  let d = ''
  for (let i = 0; i < repeat; i++) {
    const L = x
    const R = x + widthMotif
    const T = x + widthMotif / 2
    d += ` M ${L} ${shoulderY}`
    d += ` Q ${T} ${shoulderY - capHeight} ${R} ${shoulderY}`
    d += ` L ${T} ${shoulderY + tipLength}`
    d += ` Z`
    x += widthMotif
  }
  return d.trim()
}

function flyingGeese({ repeat = 6, cellW = 94, cellH = 36, height = 140 }) {
  let x = 18
  const mid = height / 2 + 10
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    d += ` L ${x + cellW / 2} ${mid - cellH}`
    d += ` L ${x + cellW} ${mid}`
    x += cellW
  }
  return d
}

function floralVine({ repeat = 5, step = 118, amp = 26, leaf = 28, height = 140 }) {
  let x = 16
  const mid = height / 2 + 2
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    const x2 = x + step
    const cx = x + step / 2
    const y = i % 2 === 0 ? mid - amp : mid + amp
    d += ` C ${x + step * 0.22} ${mid} ${cx - step * 0.18} ${y} ${cx} ${y}`
    d += ` C ${cx + step * 0.18} ${y} ${x + step * 0.78} ${mid} ${x2} ${mid}`
    d += ` M ${cx - 8} ${y}`
    d += ` q ${leaf * 0.4} ${-leaf} ${leaf} 0`
    d += ` q ${-leaf * 0.35} ${leaf * 0.85} ${-leaf} 0`
    x = x2
  }
  return d
}

function celticKnot({ repeat = 5, cellW = 104, cellH = 34, height = 140 }) {
  let x = 18
  const mid = height / 2 + 2
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    const x1 = x + cellW / 2
    const x2 = x + cellW
    d += ` C ${x + 18} ${mid - cellH} ${x1 - 18} ${mid - cellH} ${x1} ${mid}`
    d += ` C ${x1 + 18} ${mid + cellH} ${x2 - 18} ${mid + cellH} ${x2} ${mid}`
    x = x2
  }
  return d
}

function featherSpine({ repeat = 5, step = 124, amp = 22, plume = 26, height = 140 }) {
  let x = 18
  const mid = height / 2 + 4
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    const x2 = x + step
    const cx = x + step / 2
    const y = i % 2 === 0 ? mid - amp : mid + amp
    d += ` C ${x + step * 0.22} ${mid} ${cx - step * 0.18} ${y} ${cx} ${y}`
    d += ` C ${cx + step * 0.18} ${y} ${x + step * 0.78} ${mid} ${x2} ${mid}`
    d += ` M ${cx} ${y}`
    d += ` q ${-plume * 0.9} ${i % 2 === 0 ? -plume : plume} ${-plume * 1.3} 0`
    x = x2
  }
  return d
}

function artDecoFan({ repeat = 5, arcWidth = 94, arcHeight = 38, height = 140 }) {
  let x = 18
  const y = height - 20
  let d = `M ${x} ${y}`
  for (let i = 0; i < repeat; i++) {
    const x1 = x + arcWidth / 2
    const x2 = x + arcWidth
    d += ` Q ${x1} ${y - arcHeight} ${x2} ${y}`
    d += ` M ${x1} ${y}`
    d += ` L ${x1} ${y - arcHeight * 0.82}`
    x = x2
  }
  return d
}

function starCascade({ repeat = 6, step = 92, peak = 34, height = 140 }) {
  let x = 18
  const mid = height / 2 + 10
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    d += ` L ${x + step * 0.25} ${mid - peak}`
    d += ` L ${x + step * 0.5} ${mid}`
    d += ` L ${x + step * 0.75} ${mid - peak}`
    d += ` L ${x + step} ${mid}`
    x += step
  }
  return d
}

function englishOak({ repeat = 5, step = 148, amp = 22, leaf = 30, height = 220 }) {
  let x = 24
  const mid = height / 2
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    const x2 = x + step
    const cx = x + step / 2
    const y = i % 2 === 0 ? mid - amp : mid + amp
    d += ` C ${x + step * 0.22} ${mid} ${cx - 16} ${y} ${cx} ${y}`
    d += ` C ${cx + 16} ${y} ${x + step * 0.78} ${mid} ${x2} ${mid}`
    d += ` M ${cx - 8} ${y}`
    d += ` q ${leaf * 0.25} ${-leaf} ${leaf * 0.7} ${-leaf * 0.1}`
    d += ` q ${-leaf * 0.05} ${leaf * 0.6} ${-leaf * 0.7} ${leaf * 0.1}`
    d += ` M ${cx + 6} ${y + 2}`
    d += ` q ${leaf * 0.2} ${leaf * 0.75} ${leaf * 0.62} ${leaf * 0.1}`
    d += ` q ${-leaf * 0.05} ${-leaf * 0.55} ${-leaf * 0.62} ${-leaf * 0.1}`
    x = x2
  }
  return d
}

function argyle({ repeat = 6, cellW = 102, cellH = 56, height = 220 }) {
  let x = 18
  const mid = height / 2
  let d = `M ${x} ${mid}`
  for (let i = 0; i < repeat; i++) {
    d += ` L ${x + cellW / 2} ${mid - cellH}`
    d += ` L ${x + cellW} ${mid}`
    d += ` L ${x + cellW * 1.5} ${mid + cellH}`
    d += ` L ${x + cellW * 2} ${mid}`
    x += cellW * 2
  }
  return d
}

function pebble({ repeat = 9, radius = 18, width = 960, height = 220 }) {
  const cols = Math.max(3, Math.floor(width / (radius * 2.8)))
  const rows = Math.max(2, Math.floor(height / (radius * 2.8)))
  let d = ''
  let count = 0
  for (let r = 0; r < rows && count < repeat * 2; r++) {
    for (let c = 0; c < cols && count < repeat * 2; c++) {
      const cx = 24 + c * radius * 2.3 + (r % 2 ? radius : 0)
      const cy = 28 + r * radius * 2.2
      d += ` M ${cx - radius} ${cy}`
      d += ` a ${radius} ${radius} 0 1 0 ${radius * 2} 0`
      d += ` a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`
      count++
    }
  }
  return d
}

function lerp(a, b, t) {
  return a + (b - a) * t
}
