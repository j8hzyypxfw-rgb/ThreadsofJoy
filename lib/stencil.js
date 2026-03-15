// ─────────────────────────────────────────────────────────────────
// Threads of Joy — Stencil SVG Generation Engine
// 1/8" stroke (9px at 96dpi) always, regardless of size
// All designs are continuous-line (no backtracking)
// ─────────────────────────────────────────────────────────────────

export const DPI = 96
export const STROKE = 9 // 1/8" at 96dpi (fixed)

export const USERS = {
  julie: { label: "Julie", color: "#c9a96e", bg: "rgba(201,169,110,0.15)" },
  mom:   { label: "Mom",   color: "#c8a0e0", bg: "rgba(180,100,220,0.15)" },
  kim:   { label: "Kim",   color: "#7ecece", bg: "rgba(100,200,200,0.15)" },
}

export const MOTIFS = [
  'Feathers','Floral','Geometric','Modern','Traditional',
  'Western','Baby','Cats','Leaves','Vines','Stipple',
  'Clamshell','Baptist Fan','Paisley','Celtic','Stars',
  'Waves','Spirals','Art Deco','Folk',
]

export const SOURCES = [
  'Full Line Stencil','Urban Elementz','Hancy Creations',
  'Blocks / Corners','Digital / Paper',
]

export const BLOCKS = {
  ohio: 'Ohio Star', log: 'Log Cabin', nine: 'Nine Patch',
  flying: 'Flying Geese', court: 'Courthouse Steps', bear: "Bear's Paw",
  pinwheel: 'Pinwheel', churn: 'Churn Dash', hour: 'Hourglass',
  star: 'Lone Star', granny: "Grandmother's Flower Garden",
  bow: 'Bow Tie', double: 'Double Wedding Ring',
  drunkard: "Drunkard's Path", sawtooth: 'Sawtooth Star',
}

export const CATALOG = [
  { id:'c1',  name:'Flowing Feather Plume',    style:'feather',    layout:'edge',   source:'Full Line Stencil',  tags:['continuous','elegant','competition'] },
  { id:'c2',  name:'Classic Clamshell',         style:'traditional',layout:'edge',   source:'Hancy Creations',    tags:['allover','classic'] },
  { id:'c3',  name:'Baptist Fan Wave',           style:'traditional',layout:'border', source:'Urban Elementz',     tags:['border','traditional'] },
  { id:'c4',  name:'Modern Pebble Stipple',      style:'modern',     layout:'edge',   source:'Hancy Creations',    tags:['allover','dense'] },
  { id:'c5',  name:'Ohio Star Medallion',        style:'geometric',  layout:'block',  source:'Blocks / Corners',   tags:['block','competition'] },
  { id:'c6',  name:'Flying Geese Border',        style:'geometric',  layout:'border', source:'Digital / Paper',    tags:['border','geometric'] },
  { id:'c7',  name:'Floral Vine Scroll',         style:'floral',     layout:'border', source:'Urban Elementz',     tags:['border','romantic'] },
  { id:'c8',  name:'Log Cabin Echo',             style:'traditional',layout:'block',  source:'Blocks / Corners',   tags:['block','echo'] },
  { id:'c9',  name:'Feather Wreath',             style:'feather',    layout:'block',  source:'Full Line Stencil',  tags:['block','competition'] },
  { id:'c10', name:'Geometric Crosshatch',       style:'geometric',  layout:'edge',   source:'Hancy Creations',    tags:['allover','dense'] },
  { id:'c11', name:'Baby Bunny Trail',           style:'floral',     layout:'edge',   source:'Hancy Creations',    tags:['baby','sweet'] },
  { id:'c12', name:'Celtic Knotwork Border',     style:'geometric',  layout:'border', source:'Digital / Paper',    tags:['border','intricate'] },
  { id:'c13', name:'Feather Spine Plume',        style:'feather',    layout:'border', source:'Full Line Stencil',  tags:['border','elegant'] },
  { id:'c14', name:'Double Wedding Ring',        style:'traditional',layout:'block',  source:'Blocks / Corners',   tags:['block','romantic'] },
  { id:'c15', name:'Art Deco Fan',               style:'modern',     layout:'border', source:'Urban Elementz',     tags:['border','modern'] },
  { id:'c16', name:'Grandmother Garden',         style:'floral',     layout:'block',  source:'Hancy Creations',    tags:['block','floral'] },
  { id:'c17', name:'Western Longhorn',           style:'western',    layout:'edge',   source:'Urban Elementz',     tags:['western','fun'] },
  { id:'c18', name:'Stipple Cloud',              style:'modern',     layout:'edge',   source:'Hancy Creations',    tags:['allover','soft'] },
  { id:'c19', name:'Paisley Meander',            style:'floral',     layout:'edge',   source:'Full Line Stencil',  tags:['allover','boho'] },
  { id:'c20', name:'Star Cascade Border',        style:'geometric',  layout:'border', source:'Digital / Paper',    tags:['border','patriotic'] },
]

// ─────────────────────────────────────────────────
// Core SVG Generator
// ─────────────────────────────────────────────────
export function generateSVG(opts) {
  const {
    layout = 'edge',
    motifs = [],
    stencil = 'plastic',
    sW = 11.75,
    sH = 11.75,
    borderLen = 60,
    borderWidth = 6,
    blockType = 'ohio',
  } = opts

  const W = Math.round(sW * DPI)
  const H = Math.round(sH * DPI)
  const sw = STROKE
  const motif = motifs[0] || 'feather'
  const ink = '#1a0a2e'

  let inner = ''

  // ── EDGE TO EDGE ──────────────────────────────
  if (layout === 'edge') {
    const rows = Math.max(3, Math.floor(H / 72))
    const amp = Math.round(H / rows * 0.38)

    for (let r = 0; r < rows; r++) {
      const y = Math.round((r + 0.5) * (H / rows))
      const dir = r % 2 === 0 ? 1 : -1
      const segs = 12

      let d = `M 0,${y}`
      for (let i = 1; i <= segs; i++) {
        const x = Math.round((i / segs) * W)
        const cpx = Math.round(((i - 0.5) / segs) * W)
        const cpy = y + dir * (i % 2 === 0 ? -amp : amp)
        d += ` Q ${cpx},${cpy} ${x},${y}`
      }
      inner += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>\n`

      // Feather barbs
      if (motif.toLowerCase().includes('feather') || motif.toLowerCase().includes('feathers')) {
        const bstep = Math.round(W / 20)
        for (let bx = bstep; bx < W - bstep / 2; bx += bstep) {
          const bl = Math.round(amp * 0.6)
          inner += `<line x1="${bx}" y1="${y}" x2="${bx + 7}" y2="${y - bl}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>\n`
          inner += `<line x1="${bx}" y1="${y}" x2="${bx - 7}" y2="${y - bl}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>\n`
        }
      }

      // Clamshell arcs
      if (motif.toLowerCase().includes('clamshell')) {
        const cw = Math.round(W / 8)
        for (let cx2 = cw / 2; cx2 < W; cx2 += cw) {
          inner += `<path d="M ${cx2 - cw / 2},${y} A ${cw / 2},${Math.round(amp * 0.7)} 0 0 1 ${cx2 + cw / 2},${y}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.6)}"/>\n`
        }
      }
    }
  }

  // ── BORDER ────────────────────────────────────
  else if (layout === 'border') {
    const bwPx = Math.round(borderWidth * DPI)
    const effectiveH = Math.min(H, bwPx)
    const waveH = Math.round(effectiveH * 0.3)
    const segs = 14

    for (let row = 0; row < 4; row++) {
      const y = Math.round((row + 0.5) * (effectiveH / 4))
      let d = `M 0,${y}`
      for (let i = 1; i <= segs; i++) {
        const x = Math.round((i / segs) * W)
        const cpx = Math.round(((i - 0.5) / segs) * W)
        const cpy = y + (i % 2 === 0 ? -waveH : waveH)
        d += ` Q ${cpx},${cpy} ${x},${y}`
      }
      inner += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`
    }
    // Border rails
    inner += `<line x1="${sw / 2}" y1="${sw / 2}" x2="${sw / 2}" y2="${effectiveH - sw / 2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`
    inner += `<line x1="${W - sw / 2}" y1="${sw / 2}" x2="${W - sw / 2}" y2="${effectiveH - sw / 2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`
    inner += `<line x1="${sw / 2}" y1="${sw / 2}" x2="${W - sw / 2}" y2="${sw / 2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`
    inner += `<line x1="${sw / 2}" y1="${effectiveH - sw / 2}" x2="${W - sw / 2}" y2="${effectiveH - sw / 2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`
  }

  // ── BLOCK ─────────────────────────────────────
  else {
    const S = Math.min(W, H)
    const cx = Math.round(W / 2)
    const cy = Math.round(H / 2)
    const r1 = Math.round(S * 0.16)
    const r2 = Math.round(S * 0.32)
    const r3 = Math.round(S * 0.44)

    // Center medallion circles
    inner += `<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${ink}" stroke-width="${sw}"/>\n`
    inner += `<circle cx="${cx}" cy="${cy}" r="${Math.round(r1 * 0.55)}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.6)}"/>\n`

    // 4 feather arms radiating from center
    for (let a = 0; a < 4; a++) {
      const angle = (a * 90 - 45) * (Math.PI / 180)
      const x1 = Math.round(cx + Math.cos(angle) * r1)
      const y1 = Math.round(cy + Math.sin(angle) * r1)
      const x2 = Math.round(cx + Math.cos(angle) * r3)
      const y2 = Math.round(cy + Math.sin(angle) * r3)
      inner += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>\n`

      const perp = angle + Math.PI / 2
      const bl = Math.round(r1 * 0.75)
      for (let b = -4; b <= 4; b++) {
        if (b === 0) continue
        const t = (b + 5) / 10
        const bx = Math.round(x1 + (x2 - x1) * t)
        const by = Math.round(y1 + (y2 - y1) * t)
        const frac = 1 - Math.abs(b) * 0.1
        inner += `<line x1="${bx}" y1="${by}" x2="${Math.round(bx + Math.cos(perp) * bl * frac)}" y2="${Math.round(by + Math.sin(perp) * bl * frac)}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>\n`
      }
    }

    // Corner fan arcs
    ;[[0, 0, 0, 90], [W, 0, 90, 180], [0, H, 270, 360], [W, H, 180, 270]].forEach(([ocx, ocy, startD, endD]) => {
      for (let i = 1; i <= 4; i++) {
        const rr = Math.round(S * 0.08 * i)
        const sr = (startD * Math.PI) / 180
        const er = (endD * Math.PI) / 180
        const sx = Math.round(ocx + Math.cos(sr) * rr)
        const sy = Math.round(ocy + Math.sin(sr) * rr)
        const ex = Math.round(ocx + Math.cos(er) * rr)
        const ey = Math.round(ocy + Math.sin(er) * rr)
        inner += `<path d="M ${sx},${sy} A ${rr},${rr} 0 0,1 ${ex},${ey}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.55)}"/>\n`
      }
    })

    // Echo outer ring
    inner += `<circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.55)}" stroke-dasharray="0"/>\n`
  }

  // Bridge annotation for plastic stencils
  const bridgeLine = stencil === 'plastic'
    ? `<text x="${Math.round(W / 2)}" y="${H - 10}" text-anchor="middle" font-size="15" fill="#aaaaaa" font-family="Georgia,serif">Bridges: 1/16" wide · 3/4" spacing · cut on 7mil Mylar</text>\n`
    : `<text x="${Math.round(W / 2)}" y="${H - 10}" text-anchor="middle" font-size="15" fill="#aaaaaa" font-family="Georgia,serif">Silk Screen · no bridges · continuous line</text>\n`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="6,4"/>
  ${inner}
  ${bridgeLine}
  <text x="10" y="${H - 28}" font-size="13" fill="#cccccc" font-family="Georgia,serif">Threads of Joy · ${motifs.join(', ') || 'Custom'} · ${layout} · 1/8" line · ${sW.toFixed(2)}"×${sH.toFixed(2)}"</text>
</svg>`
}

// ─────────────────────────────────────────────────
// Thumbnail SVG for catalog / favorites cards
// ─────────────────────────────────────────────────
export function thumbnailSVG(style) {
  const W = 200, H = 130, sw = 3.5, c = '#7c3aed'

  if (style === 'feather') {
    let p = ''
    for (let i = 0; i < 3; i++) {
      const y = 20 + i * 42
      p += `<path d="M 8,${y} C 55,${y - 22} 145,${y + 22} 192,${y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`
      for (let bx = 24; bx < 188; bx += 22) {
        p += `<line x1="${bx}" y1="${y}" x2="${bx + 7}" y2="${y - 16}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
        p += `<line x1="${bx}" y1="${y}" x2="${bx - 7}" y2="${y - 16}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
      }
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`
  }

  if (style === 'floral') {
    let p = `<circle cx="100" cy="65" r="16" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    for (let a = 0; a < 6; a++) {
      const ang = a * 60 * (Math.PI / 180)
      p += `<ellipse cx="${100 + 35 * Math.cos(ang)}" cy="${65 + 28 * Math.sin(ang)}" rx="17" ry="11" transform="rotate(${a * 60} ${100 + 35 * Math.cos(ang)} ${65 + 28 * Math.sin(ang)})" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`
  }

  if (style === 'geometric') {
    let p = ''
    for (let i = 0; i < 4; i++) p += `<line x1="${20 + i * 52}" y1="10" x2="${20 + i * 52}" y2="120" stroke="${c}" stroke-width="${sw}"/>`
    for (let i = 0; i < 3; i++) p += `<line x1="10" y1="${20 + i * 42}" x2="190" y2="${20 + i * 42}" stroke="${c}" stroke-width="${sw}"/>`
    p += `<line x1="10" y1="10" x2="190" y2="120" stroke="${c}" stroke-width="${sw}" opacity="0.4"/>`
    p += `<line x1="190" y1="10" x2="10" y2="120" stroke="${c}" stroke-width="${sw}" opacity="0.4"/>`
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`
  }

  if (style === 'modern') {
    let p = ''
    for (let i = 0; i < 9; i++) {
      const cx2 = 18 + i * 22, cy2 = 38 + Math.sin(i * 0.9) * 30
      p += `<ellipse cx="${cx2}" cy="${cy2}" rx="13" ry="11" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`
  }

  // traditional / default
  let p = ''
  for (let i = 0; i < 3; i++) p += `<rect x="${12 + i * 20}" y="${10 + i * 18}" width="${176 - i * 40}" height="${110 - i * 36}" fill="none" stroke="${c}" stroke-width="${sw}"/>`
  p += `<circle cx="100" cy="65" r="20" fill="none" stroke="${c}" stroke-width="${sw * 0.7}"/>`
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${p}</svg>`
}
