// ─────────────────────────────────────────────────────────────────
// Threads of Joy — Stencil SVG Generation Engine
// Fixed 1/8" stroke. Continuous-line. All features.
// ─────────────────────────────────────────────────────────────────

export const DPI = 96
export const STROKE = 9 // 1/8" at 96dpi — never changes

export const USERS = {
  julie: { label: 'Julie', color: '#c9a96e', bg: 'rgba(201,169,110,0.15)' },
  mom:   { label: 'Mom',   color: '#c8a0e0', bg: 'rgba(180,100,220,0.15)' },
  kim:   { label: 'Kim',   color: '#7ecece', bg: 'rgba(100,200,200,0.15)' },
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
  { id:'c1',  name:'Flowing Feather Plume',   style:'feather',    layout:'edge',   source:'Full Line Stencil', tags:['continuous','elegant','competition'] },
  { id:'c2',  name:'Classic Clamshell',        style:'traditional',layout:'edge',   source:'Hancy Creations',   tags:['allover','classic'] },
  { id:'c3',  name:'Baptist Fan Wave',          style:'traditional',layout:'border', source:'Urban Elementz',    tags:['border','traditional'] },
  { id:'c4',  name:'Modern Pebble Stipple',     style:'modern',     layout:'edge',   source:'Hancy Creations',   tags:['allover','dense'] },
  { id:'c5',  name:'Ohio Star Medallion',       style:'geometric',  layout:'block',  source:'Blocks / Corners',  tags:['block','competition'] },
  { id:'c6',  name:'Flying Geese Border',       style:'geometric',  layout:'border', source:'Digital / Paper',   tags:['border','geometric'] },
  { id:'c7',  name:'Floral Vine Scroll',        style:'floral',     layout:'border', source:'Urban Elementz',    tags:['border','romantic'] },
  { id:'c8',  name:'Log Cabin Echo',            style:'traditional',layout:'block',  source:'Blocks / Corners',  tags:['block','echo'] },
  { id:'c9',  name:'Feather Wreath',            style:'feather',    layout:'block',  source:'Full Line Stencil', tags:['block','competition'] },
  { id:'c10', name:'Geometric Crosshatch',      style:'geometric',  layout:'edge',   source:'Hancy Creations',   tags:['allover','dense'] },
  { id:'c11', name:'Baby Bunny Trail',          style:'floral',     layout:'edge',   source:'Hancy Creations',   tags:['baby','sweet'] },
  { id:'c12', name:'Celtic Knotwork Border',    style:'geometric',  layout:'border', source:'Digital / Paper',   tags:['border','intricate'] },
  { id:'c13', name:'Feather Spine Plume',       style:'feather',    layout:'border', source:'Full Line Stencil', tags:['border','elegant'] },
  { id:'c14', name:'Double Wedding Ring',       style:'traditional',layout:'block',  source:'Blocks / Corners',  tags:['block','romantic'] },
  { id:'c15', name:'Art Deco Fan',              style:'modern',     layout:'border', source:'Urban Elementz',    tags:['border','modern'] },
  { id:'c16', name:'Grandmother Garden',        style:'floral',     layout:'block',  source:'Hancy Creations',   tags:['block','floral'] },
  { id:'c17', name:'Western Longhorn',          style:'western',    layout:'edge',   source:'Urban Elementz',    tags:['western','fun'] },
  { id:'c18', name:'Stipple Cloud',             style:'modern',     layout:'edge',   source:'Hancy Creations',   tags:['allover','soft'] },
  { id:'c19', name:'Paisley Meander',           style:'floral',     layout:'edge',   source:'Full Line Stencil', tags:['allover','boho'] },
  { id:'c20', name:'Star Cascade Border',       style:'geometric',  layout:'border', source:'Digital / Paper',   tags:['border','patriotic'] },
]

// ─────────────────────────────────────────────────────────────────
// DENSITY helpers
// minGap / maxGap in inches → converted to px
// complexity: 1=simple, 2=moderate, 3=complex, 4=heirloom
// machine: 'longarm' | 'domestic'
// ─────────────────────────────────────────────────────────────────
function gapPx(inches) { return Math.round(inches * DPI) }

// Longarm can handle tighter turns and more intricate curves.
// Domestic machines need slightly wider spacing and gentler curves.
function machineAdjust(val, machine) {
  return machine === 'domestic' ? val * 1.25 : val
}

// ─────────────────────────────────────────────────────────────────
// CORE SVG GENERATOR
// opts: { layout, motifs, stencil, sW, sH, borderWidth, blockType,
//         complexity, machine, minGap, maxGap, variableDensity }
// ─────────────────────────────────────────────────────────────────
export function generateSVG(opts = {}) {
  const {
    layout        = 'edge',
    motifs        = ['Feathers'],
    stencil       = 'plastic',
    sW            = 11.75,
    sH            = 11.75,
    borderWidth   = 6,
    blockType     = 'ohio',
    complexity    = 2,
    machine       = 'longarm',
    minGap        = 0.5,
    maxGap        = 1.0,
    variableDensity = false,
  } = opts

  const W = Math.round(sW * DPI)
  const H = Math.round(sH * DPI)
  const sw = STROKE
  const ink = '#1a0a2e'
  const motif = (motifs[0] || 'Feathers').toLowerCase()

  // Gap range in px
  const minG = gapPx(machineAdjust(minGap, machine))
  const maxG = gapPx(machineAdjust(maxGap, machine))
  // Complexity controls: row count, barb count, echo count, arc detail
  const rowSpacing = variableDensity
    ? null // computed per-row below
    : Math.round((minG + maxG) / 2)
  const barbDensity = Math.round(4 + complexity * 2)   // 6–12
  const echoCount   = Math.round(complexity)             // 1–4
  const curveDetail = Math.round(8 + complexity * 3)    // 11–20 segments

  let paths = []

  // ── EDGE TO EDGE ──────────────────────────────────────────────
  if (layout === 'edge') {
    // Build rows. Variable density: alternate tight and wide rows.
    const baseSpacing = rowSpacing || Math.round((minG + maxG) / 2)
    let y = baseSpacing / 2
    let rowIndex = 0

    while (y < H) {
      const dir = rowIndex % 2 === 0 ? 1 : -1
      // Variable density: odd rows tight, even rows wide
      const amp = variableDensity
        ? (rowIndex % 2 === 0 ? Math.round(minG * 0.8) : Math.round(maxG * 0.6))
        : Math.round(baseSpacing * 0.55)

      // Main spine wave
      let d = `M 0,${Math.round(y)}`
      for (let i = 1; i <= curveDetail; i++) {
        const x = Math.round((i / curveDetail) * W)
        const cpx = Math.round(((i - 0.5) / curveDetail) * W)
        const cpy = Math.round(y + dir * (i % 2 === 0 ? -amp : amp))
        d += ` Q ${cpx},${cpy} ${x},${Math.round(y)}`
      }
      paths.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`)

      // Feather barbs
      if (motif.includes('feather')) {
        const bStep = Math.round(W / (barbDensity * curveDetail / 8))
        for (let bx = bStep; bx < W - bStep / 2; bx += bStep) {
          const bl = Math.round(amp * 0.65)
          paths.push(`<line x1="${bx}" y1="${Math.round(y)}" x2="${bx + 7}" y2="${Math.round(y) - bl}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>`)
          paths.push(`<line x1="${bx}" y1="${Math.round(y)}" x2="${bx - 7}" y2="${Math.round(y) - bl}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>`)
          // Extra barb detail for complexity 3+
          if (complexity >= 3) {
            paths.push(`<line x1="${bx + 4}" y1="${Math.round(y) - Math.round(bl * 0.4)}" x2="${bx + 12}" y2="${Math.round(y) - Math.round(bl * 0.8)}" stroke="${ink}" stroke-width="${Math.round(sw * 0.35)}" stroke-linecap="round"/>`)
            paths.push(`<line x1="${bx - 4}" y1="${Math.round(y) - Math.round(bl * 0.4)}" x2="${bx - 12}" y2="${Math.round(y) - Math.round(bl * 0.8)}" stroke="${ink}" stroke-width="${Math.round(sw * 0.35)}" stroke-linecap="round"/>`)
          }
        }
      }

      // Clamshell arcs
      if (motif.includes('clamshell')) {
        const cw = Math.round(baseSpacing * 1.1)
        for (let cx = cw / 2; cx < W; cx += cw) {
          paths.push(`<path d="M ${Math.round(cx - cw/2)},${Math.round(y)} A ${Math.round(cw/2)},${Math.round(amp * 0.8)} 0 0 1 ${Math.round(cx + cw/2)},${Math.round(y)}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.65)}"/>`)
        }
      }

      // Stipple bubbles for modern/stipple
      if (motif.includes('stipple') || motif.includes('modern')) {
        const bStep2 = Math.round(baseSpacing * 1.2)
        for (let bx2 = bStep2; bx2 < W - bStep2; bx2 += bStep2) {
          const r = Math.round(baseSpacing * 0.3)
          paths.push(`<circle cx="${bx2}" cy="${Math.round(y)}" r="${r}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.6)}"/>`)
        }
      }

      // Echo lines for complexity 3+
      if (complexity >= 3 && rowIndex % 2 === 0 && y + minG < H) {
        const echoY = Math.round(y + minG * 0.4)
        let ed = `M 0,${echoY}`
        for (let i = 1; i <= curveDetail; i++) {
          const x = Math.round((i / curveDetail) * W)
          const cpx = Math.round(((i - 0.5) / curveDetail) * W)
          const cpy = Math.round(echoY + dir * (i % 2 === 0 ? -amp * 0.5 : amp * 0.5))
          ed += ` Q ${cpx},${cpy} ${x},${echoY}`
        }
        paths.push(`<path d="${ed}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.45)}" stroke-linecap="round" stroke-dasharray="${complexity >= 4 ? '0' : '4,3'}"/>`)
      }

      // Advance y by gap (variable or fixed)
      const gap = variableDensity
        ? (rowIndex % 3 === 0 ? minG : rowIndex % 3 === 1 ? maxG : Math.round((minG + maxG) / 2))
        : baseSpacing
      y += gap
      rowIndex++
    }
  }

  // ── BORDER ────────────────────────────────────────────────────
  else if (layout === 'border') {
    const bwPx = Math.min(H, Math.round(borderWidth * DPI))
    const gap = rowSpacing || Math.round((minG + maxG) / 2)
    const rows = Math.max(2, Math.floor(bwPx / gap))

    for (let r = 0; r < rows; r++) {
      const y = Math.round((r + 0.5) * (bwPx / rows))
      const amp = variableDensity
        ? (r % 2 === 0 ? Math.round(gap * 0.35) : Math.round(gap * 0.6))
        : Math.round(gap * 0.45)

      let d = `M 0,${y}`
      for (let i = 1; i <= curveDetail; i++) {
        const x = Math.round((i / curveDetail) * W)
        const cpx = Math.round(((i - 0.5) / curveDetail) * W)
        const cpy = y + (i % 2 === 0 ? -amp : amp)
        d += ` Q ${cpx},${cpy} ${x},${y}`
      }
      paths.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)

      if (motif.includes('feather')) {
        const bStep = Math.round(W / (barbDensity * 2))
        for (let bx = bStep; bx < W; bx += bStep) {
          const bl = Math.round(amp * 0.7)
          paths.push(`<line x1="${bx}" y1="${y}" x2="${bx+6}" y2="${y-bl}" stroke="${ink}" stroke-width="${Math.round(sw*0.5)}" stroke-linecap="round"/>`)
          paths.push(`<line x1="${bx}" y1="${y}" x2="${bx-6}" y2="${y-bl}" stroke="${ink}" stroke-width="${Math.round(sw*0.5)}" stroke-linecap="round"/>`)
        }
      }
    }
    // Border rails
    const hs = Math.round(sw / 2)
    const bwEff = Math.min(H, Math.round(borderWidth * DPI))
    paths.push(`<line x1="${hs}" y1="${hs}" x2="${hs}" y2="${bwEff - hs}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)
    paths.push(`<line x1="${W - hs}" y1="${hs}" x2="${W - hs}" y2="${bwEff - hs}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)
    paths.push(`<line x1="${hs}" y1="${hs}" x2="${W - hs}" y2="${hs}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)
    paths.push(`<line x1="${hs}" y1="${bwEff - hs}" x2="${W - hs}" y2="${bwEff - hs}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)
  }

  // ── BLOCK ─────────────────────────────────────────────────────
  else {
    const S = Math.min(W, H)
    const cx = Math.round(W / 2)
    const cy = Math.round(H / 2)
    const r1 = Math.round(S * 0.14)
    const r2 = Math.round(S * 0.30)
    const r3 = Math.round(S * 0.43)

    // Center medallion — echoes based on complexity
    for (let e = 0; e < echoCount; e++) {
      const er = Math.round(r1 * (0.4 + e * 0.22))
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${er}" fill="none" stroke="${ink}" stroke-width="${e === 0 ? sw : Math.round(sw * 0.6)}"/>`)
    }

    // Radiating feather arms
    const arms = complexity >= 3 ? 8 : 4
    for (let a = 0; a < arms; a++) {
      const angle = (a * (360 / arms) - 45) * (Math.PI / 180)
      const x1 = Math.round(cx + Math.cos(angle) * r1)
      const y1 = Math.round(cy + Math.sin(angle) * r1)
      const x2 = Math.round(cx + Math.cos(angle) * r3)
      const y2 = Math.round(cy + Math.sin(angle) * r3)
      paths.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`)

      const perp = angle + Math.PI / 2
      const bl = Math.round(r1 * 0.8)
      const barbCount = Math.round(5 + complexity * 1.5)
      for (let b = 1; b < barbCount; b++) {
        const t = b / barbCount
        const bx = Math.round(x1 + (x2 - x1) * t)
        const by = Math.round(y1 + (y2 - y1) * t)
        const frac = 1 - Math.abs(t - 0.5) * 0.8
        paths.push(`<line x1="${bx}" y1="${by}" x2="${Math.round(bx + Math.cos(perp) * bl * frac)}" y2="${Math.round(by + Math.sin(perp) * bl * frac)}" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}" stroke-linecap="round"/>`)
        if (complexity >= 3) {
          paths.push(`<line x1="${bx}" y1="${by}" x2="${Math.round(bx - Math.cos(perp) * bl * frac * 0.6)}" y2="${Math.round(by - Math.sin(perp) * bl * frac * 0.6)}" stroke="${ink}" stroke-width="${Math.round(sw * 0.35)}" stroke-linecap="round"/>`)
        }
      }
    }

    // Corner fan arcs — more arcs for higher complexity
    const fanCount = Math.round(3 + complexity)
    ;[[0,0,0,90],[W,0,90,180],[0,H,270,360],[W,H,180,270]].forEach(([ocx,ocy,sd,ed]) => {
      for (let i = 1; i <= fanCount; i++) {
        const rr = Math.round(S * 0.07 * i)
        const sr = (sd * Math.PI) / 180
        const er2 = (ed * Math.PI) / 180
        const sx = Math.round(ocx + Math.cos(sr) * rr)
        const sy = Math.round(ocy + Math.sin(sr) * rr)
        const ex = Math.round(ocx + Math.cos(er2) * rr)
        const ey = Math.round(ocy + Math.sin(er2) * rr)
        paths.push(`<path d="M ${sx},${sy} A ${rr},${rr} 0 0,1 ${ex},${ey}" fill="none" stroke="${ink}" stroke-width="${i === 1 ? sw : Math.round(sw * 0.55)}"/>`)
      }
    })

    // Outer echo ring
    paths.push(`<circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.5)}"/>`)
    if (complexity >= 3) {
      paths.push(`<circle cx="${cx}" cy="${cy}" r="${Math.round(r2 * 1.25)}" fill="none" stroke="${ink}" stroke-width="${Math.round(sw * 0.4)}"/>`)
    }
  }

  // ── ANNOTATIONS ───────────────────────────────────────────────
  const bridgeNote = stencil === 'plastic'
    ? `<text x="${Math.round(W/2)}" y="${H - 12}" text-anchor="middle" font-size="14" fill="#aaaaaa" font-family="Georgia,serif">Bridges: 1/16" · 0.75" spacing · 7mil Mylar</text>`
    : `<text x="${Math.round(W/2)}" y="${H - 12}" text-anchor="middle" font-size="14" fill="#aaaaaa" font-family="Georgia,serif">Silk Screen · bridgeless · continuous line</text>`

  const machineNote = `<text x="12" y="${H - 28}" font-size="12" fill="#cccccc" font-family="Georgia,serif">${machine === 'longarm' ? 'Longarm' : 'Domestic'} · Complexity ${complexity} · Gap ${minGap}"${variableDensity ? `–${maxGap}"` : ''}</text>`

  const footerNote = `<text x="12" y="${H - 12}" font-size="12" fill="#cccccc" font-family="Georgia,serif">Threads of Joy · ${motifs.join(', ')} · ${layout} · 1/8" line · ${sW.toFixed(2)}"×${sH.toFixed(2)}"</text>`

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="white"/>`,
    `<rect x="5" y="5" width="${W-10}" height="${H-10}" fill="none" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="6,4"/>`,
    ...paths,
    bridgeNote,
    machineNote,
    footerNote,
    `</svg>`,
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────
// THUMBNAIL SVG for catalog cards
// ─────────────────────────────────────────────────────────────────
export function thumbnailSVG(style) {
  const W = 200, H = 130, sw = 3.5, c = '#7c3aed'

  if (style === 'feather') {
    let p = ''
    for (let i = 0; i < 3; i++) {
      const y = 22 + i * 40
      p += `<path d="M 8,${y} C 55,${y-20} 145,${y+20} 192,${y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`
      for (let bx = 24; bx < 188; bx += 20) {
        p += `<line x1="${bx}" y1="${y}" x2="${bx+7}" y2="${y-15}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
        p += `<line x1="${bx}" y1="${y}" x2="${bx-7}" y2="${y-15}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
      }
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`
  }
  if (style === 'floral') {
    let p = `<circle cx="100" cy="65" r="16" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    for (let a = 0; a < 6; a++) {
      const ang = a * 60 * (Math.PI / 180)
      p += `<ellipse cx="${100+35*Math.cos(ang)}" cy="${65+28*Math.sin(ang)}" rx="17" ry="11" transform="rotate(${a*60} ${100+35*Math.cos(ang)} ${65+28*Math.sin(ang)})" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`
  }
  if (style === 'geometric') {
    let p = ''
    for (let i = 0; i < 4; i++) p += `<line x1="${20+i*52}" y1="10" x2="${20+i*52}" y2="120" stroke="${c}" stroke-width="${sw}"/>`
    for (let i = 0; i < 3; i++) p += `<line x1="10" y1="${20+i*44}" x2="190" y2="${20+i*44}" stroke="${c}" stroke-width="${sw}"/>`
    p += `<line x1="10" y1="10" x2="190" y2="120" stroke="${c}" stroke-width="${sw}" opacity="0.4"/>`
    p += `<line x1="190" y1="10" x2="10" y2="120" stroke="${c}" stroke-width="${sw}" opacity="0.4"/>`
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`
  }
  if (style === 'modern') {
    let p = ''
    for (let i = 0; i < 9; i++) {
      const cx2 = 18 + i * 22, cy2 = 38 + Math.sin(i * 0.9) * 28
      p += `<ellipse cx="${cx2}" cy="${cy2}" rx="13" ry="11" fill="none" stroke="${c}" stroke-width="${sw}"/>`
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`
  }
  // traditional / default
  let p = ''
  for (let i = 0; i < 3; i++) p += `<rect x="${12+i*20}" y="${10+i*18}" width="${176-i*40}" height="${110-i*36}" fill="none" stroke="${c}" stroke-width="${sw}"/>`
  p += `<circle cx="100" cy="65" r="22" fill="none" stroke="${c}" stroke-width="${sw*0.7}"/>`
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`
}
