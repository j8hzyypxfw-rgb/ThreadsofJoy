// Drop in replacement for lib/stencil.js in ThreadsofJoy
// Focus: keep existing UI intact while replacing the geometry engine
// with family specific quilting generators that produce cleaner,
// more realistic continuous line pantograph style SVGs.

export const DPI = 96;
export const STROKE = 9; // 1/8in at 96 DPI

export const USERS = {
  julie: { label: 'Julie', color: '#c9a96e', bg: 'rgba(201,169,110,0.15)' },
  mom: { label: 'Mom', color: '#c8a0e0', bg: 'rgba(180,100,220,0.15)' },
  kim: { label: 'Kim', color: '#7ecece', bg: 'rgba(100,200,200,0.15)' },
};

export const MOTIFS = [
  'Feathers','Floral','Geometric','Modern','Traditional',
  'Western','Baby','Cats','Leaves','Vines','Stipple',
  'Clamshell','Baptist Fan','Paisley','Celtic','Stars',
  'Waves','Spirals','Art Deco','Folk',
];

export const SOURCES = [
  'Full Line Stencil','Urban Elementz','Hancy Creations',
  'Blocks / Corners','Digital / Paper',
];

export const BLOCKS = {
  ohio: 'Ohio Star',
  log: 'Log Cabin',
  nine: 'Nine Patch',
  flying: 'Flying Geese',
  court: 'Courthouse Steps',
  bear: "Bear's Paw",
  pinwheel: 'Pinwheel',
  churn: 'Churn Dash',
  hour: 'Hourglass',
  star: 'Lone Star',
  granny: "Grandmother's Flower Garden",
  bow: 'Bow Tie',
  double: 'Double Wedding Ring',
  drunkard: "Drunkard's Path",
  sawtooth: 'Sawtooth Star',
};

export const CATALOG = [
  { id:'c1', name:'Flowing Feather Plume', style:'feather', layout:'edge', source:'Full Line Stencil', tags:['continuous','elegant','competition'] },
  { id:'c2', name:'Classic Clamshell', style:'traditional',layout:'edge', source:'Hancy Creations', tags:['allover','classic'] },
  { id:'c3', name:'Baptist Fan Wave', style:'traditional',layout:'border', source:'Urban Elementz', tags:['border','traditional'] },
  { id:'c4', name:'Modern Pebble Stipple', style:'modern', layout:'edge', source:'Hancy Creations', tags:['allover','dense'] },
  { id:'c5', name:'Ohio Star Medallion', style:'geometric', layout:'block', source:'Blocks / Corners', tags:['block','competition'] },
  { id:'c6', name:'Flying Geese Border', style:'geometric', layout:'border', source:'Digital / Paper', tags:['border','geometric'] },
  { id:'c7', name:'Floral Vine Scroll', style:'floral', layout:'border', source:'Urban Elementz', tags:['border','romantic'] },
  { id:'c8', name:'Log Cabin Echo', style:'traditional',layout:'block', source:'Blocks / Corners', tags:['block','echo'] },
  { id:'c9', name:'Feather Wreath', style:'feather', layout:'block', source:'Full Line Stencil', tags:['block','competition'] },
  { id:'c10', name:'Geometric Crosshatch', style:'geometric', layout:'edge', source:'Hancy Creations', tags:['allover','dense'] },
  { id:'c11', name:'Baby Bunny Trail', style:'floral', layout:'edge', source:'Hancy Creations', tags:['baby','sweet'] },
  { id:'c12', name:'Celtic Knotwork Border', style:'geometric', layout:'border', source:'Digital / Paper', tags:['border','intricate'] },
  { id:'c13', name:'Feather Spine Plume', style:'feather', layout:'border', source:'Full Line Stencil', tags:['border','elegant'] },
  { id:'c14', name:'Double Wedding Ring', style:'traditional',layout:'block', source:'Blocks / Corners', tags:['block','romantic'] },
  { id:'c15', name:'Art Deco Fan', style:'modern', layout:'border', source:'Urban Elementz', tags:['border','modern'] },
  { id:'c16', name:'Grandmother Garden', style:'floral', layout:'block', source:'Hancy Creations', tags:['block','floral'] },
  { id:'c17', name:'Western Longhorn', style:'western', layout:'edge', source:'Urban Elementz', tags:['western','fun'] },
  { id:'c18', name:'Stipple Cloud', style:'modern', layout:'edge', source:'Hancy Creations', tags:['allover','soft'] },
  { id:'c19', name:'Paisley Meander', style:'floral', layout:'edge', source:'Full Line Stencil', tags:['allover','boho'] },
  { id:'c20', name:'Star Cascade Border', style:'geometric', layout:'border', source:'Digital / Paper', tags:['border','patriotic'] },
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function gapPx(inches) {
  return Math.round(inches * DPI);
}

function esc(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function round(n) {
  return Number(n.toFixed(2));
}

function line(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${round(first[0])} ${round(first[1])} ` + rest.map(([x, y]) => `L ${round(x)} ${round(y)}`).join(' ');
}

function familyFromMotifs(motifs = []) {
  const names = motifs.map((m) => String(m).toLowerCase());
  if (names.some((m) => m.includes('feather'))) return 'feather';
  if (names.some((m) => m.includes('clamshell') || m.includes('baptist'))) return 'clamshell';
  if (names.some((m) => m.includes('leaf') || m.includes('vine') || m.includes('floral') || m.includes('paisley'))) return 'vine';
  if (names.some((m) => m.includes('wave') || m.includes('art deco'))) return 'ribbon';
  if (names.some((m) => m.includes('spiral') || m.includes('stipple'))) return 'spiral';
  if (names.some((m) => m.includes('geometric') || m.includes('celtic') || m.includes('star') || m.includes('modern'))) return 'argyle';
  return 'leaf';
}

function densityScale(params) {
  const gap = params.variableDensity ? (params.minGap + params.maxGap) / 2 : params.minGap;
  const px = gapPx(gap);
  return clamp(px / 72, 0.65, 2.4);
}

function styleFromParams(params) {
  const family = familyFromMotifs(params.motifs || []);
  const density = densityScale(params);
  const complexity = clamp(params.complexity || 2, 1, 4);
  const domesticFactor = params.machine === 'domestic' ? 0.84 : 1;
  return {
    family,
    density,
    complexity,
    domesticFactor,
    inset: STROKE + 8,
    amp: 20 * complexity * domesticFactor,
    span: clamp(110 * density * domesticFactor, 70, 210),
    detail: clamp(0.35 + complexity * 0.12, 0.4, 0.9),
  };
}

function wrapSvg({ width, height, body, defs = '', title = 'Threads of Joy', plastic = false }) {
  const bridgeMask = plastic
    ? `<g opacity="0.14">${bridgeMarkers(width, height)}</g>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" width="${round(width)}" height="${round(height)}" fill="none">
  <title>${esc(title)}</title>
  ${defs}
  <rect width="100%" height="100%" fill="white"/>
  ${body}
  ${bridgeMask}
</svg>`;
}

function bridgeMarkers(width, height) {
  const marks = [];
  const gap = 72; // purely visual hint, not destructive cuts
  for (let x = gap; x < width - gap; x += gap) {
    marks.push(`<line x1="${x}" y1="8" x2="${x}" y2="18" stroke="#9ca3af" stroke-width="2"/>`);
  }
  for (let y = gap; y < height - gap; y += gap) {
    marks.push(`<line x1="8" y1="${y}" x2="18" y2="${y}" stroke="#9ca3af" stroke-width="2"/>`);
  }
  return marks.join('');
}

function makePath(d, cls = '') {
  return `<path d="${d}" ${cls} stroke="#111" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function quadRibbon(x0, y0, span, amp, repeats) {
  let d = `M ${round(x0)} ${round(y0)} `;
  let x = x0;
  for (let i = 0; i < repeats; i += 1) {
    const x1 = x + span / 2;
    const x2 = x + span;
    const dir = i % 2 === 0 ? -1 : 1;
    d += `Q ${round(x + span * 0.25)} ${round(y0 + amp * dir)} ${round(x1)} ${round(y0 + amp * dir)} `;
    d += `Q ${round(x + span * 0.75)} ${round(y0 + amp * dir)} ${round(x2)} ${round(y0)} `;
    x = x2;
  }
  return d.trim();
}

function clamshellStrip(width, yBase, inset, style) {
  const radius = clamp(style.span * 0.48, 30, 95);
  const repeats = Math.max(3, Math.floor((width - inset * 2) / (radius * 2)));
  let x = inset;
  let d = `M ${round(x)} ${round(yBase)} `;
  for (let i = 0; i < repeats; i += 1) {
    x += radius * 2;
    d += `A ${round(radius)} ${round(radius)} 0 0 1 ${round(x)} ${round(yBase)} `;
  }
  return d.trim();
}

function baptistFanStrip(width, yBase, inset, style) {
  const fan = clamp(style.span * 0.55, 40, 110);
  const step = fan * 1.18;
  const repeats = Math.max(3, Math.floor((width - inset * 2) / step));
  let d = `M ${round(inset)} ${round(yBase)} `;
  let x = inset;
  for (let i = 0; i < repeats; i += 1) {
    d += `A ${round(fan)} ${round(fan)} 0 0 1 ${round(x + step)} ${round(yBase)} `;
    d += `A ${round(fan * 0.68)} ${round(fan * 0.68)} 0 0 0 ${round(x + step * 0.7)} ${round(yBase)} `;
    d += `A ${round(fan * 0.38)} ${round(fan * 0.38)} 0 0 1 ${round(x + step)} ${round(yBase)} `;
    x += step;
  }
  return d.trim();
}

function leafMotif(x, y, width, height) {
  const half = width / 2;
  return `M ${round(x)} ${round(y)} C ${round(x + half * 0.1)} ${round(y - height * 0.78)} ${round(x + width * 0.78)} ${round(y - height * 0.72)} ${round(x + width)} ${round(y)} L ${round(x + width * 0.54)} ${round(y + height)} Z`;
}

function leafChainStrip(width, yBase, inset, style, flipped = false) {
  const motifW = clamp(style.span * 0.92, 64, 155);
  const motifH = clamp(style.amp * 2.1, 70, 180);
  const repeats = Math.max(4, Math.floor((width - inset * 2) / (motifW * 0.96)));
  const parts = [];
  let x = inset;
  for (let i = 0; i < repeats; i += 1) {
    const up = flipped ? i % 2 === 1 : i % 2 === 0;
    const y = up ? yBase + motifH * 0.58 : yBase - motifH * 0.58;
    const sign = up ? -1 : 1;
    parts.push(`M ${round(x)} ${round(yBase)} Q ${round(x + motifW * 0.48)} ${round(yBase + sign * motifH * 0.9)} ${round(x + motifW)} ${round(yBase)} L ${round(x + motifW * 0.55)} ${round(yBase + sign * motifH * 0.9)} Z`);
    x += motifW * 0.94;
  }
  return parts.join(' ');
}

function argyleStrip(width, yBase, inset, style) {
  const cellW = clamp(style.span, 56, 140);
  const cellH = clamp(style.amp * 1.8, 50, 130);
  const repeats = Math.max(3, Math.floor((width - inset * 2) / (cellW * 2)));
  let x = inset;
  let d = `M ${round(x)} ${round(yBase)} `;
  for (let i = 0; i < repeats; i += 1) {
    d += `L ${round(x + cellW)} ${round(yBase - cellH)} `;
    d += `L ${round(x + cellW * 2)} ${round(yBase)} `;
    d += `L ${round(x + cellW * 3)} ${round(yBase + cellH)} `;
    d += `L ${round(x + cellW * 4)} ${round(yBase)} `;
    x += cellW * 2;
  }
  return d.trim();
}

function spiralStrip(width, yBase, inset, style) {
  const step = clamp(style.span * 0.95, 70, 150);
  const loops = Math.max(3, Math.floor((width - inset * 2) / step));
  let x = inset;
  let d = `M ${round(x)} ${round(yBase)} `;
  for (let i = 0; i < loops; i += 1) {
    const cx = x + step * 0.5;
    const amp = clamp(style.amp * 0.7 + (i % 2) * 8, 22, 75);
    d += `C ${round(x + step * 0.12)} ${round(yBase - amp)} ${round(cx - step * 0.12)} ${round(yBase - amp)} ${round(cx)} ${round(yBase)} `;
    d += `C ${round(cx + step * 0.12)} ${round(yBase + amp)} ${round(x + step * 0.88)} ${round(yBase + amp)} ${round(x + step)} ${round(yBase)} `;
    x += step;
  }
  return d.trim();
}

function ribbonStrip(width, yBase, inset, style) {
  const repeats = Math.max(4, Math.floor((width - inset * 2) / style.span));
  return quadRibbon(inset, yBase, style.span, clamp(style.amp * 1.1, 24, 95), repeats);
}

function vineStrip(width, yBase, inset, style) {
  const span = clamp(style.span, 70, 160);
  const repeats = Math.max(4, Math.floor((width - inset * 2) / span));
  const amp = clamp(style.amp * 0.9, 24, 70);
  let d = quadRibbon(inset, yBase, span, amp, repeats);
  let x = inset + span * 0.5;
  for (let i = 0; i < repeats; i += 1) {
    const dir = i % 2 === 0 ? -1 : 1;
    const y1 = yBase + dir * (amp * 0.2);
    const y2 = yBase + dir * (amp * 1.3);
    const lx = x + span * 0.06;
    const rx = x + span * 0.28;
    d += ` M ${round(x)} ${round(y1)} C ${round(x - span * 0.18)} ${round(y2)} ${round(lx)} ${round(y2 + dir * 10)} ${round(rx)} ${round(y1 + dir * 8)}`;
    x += span;
  }
  return d.trim();
}

function featherStrip(width, yBase, inset, style) {
  const spineSpan = clamp(style.span, 85, 170);
  const repeats = Math.max(4, Math.floor((width - inset * 2) / spineSpan));
  const amp = clamp(style.amp, 22, 62);
  let d = `M ${round(inset)} ${round(yBase)} `;
  let x = inset;
  for (let i = 0; i < repeats; i += 1) {
    const dir = i % 2 === 0 ? -1 : 1;
    const x1 = x + spineSpan * 0.5;
    const x2 = x + spineSpan;
    d += `C ${round(x + spineSpan * 0.2)} ${round(yBase + amp * dir)} ${round(x + spineSpan * 0.32)} ${round(yBase + amp * dir)} ${round(x1)} ${round(yBase + amp * dir)} `;
    d += `C ${round(x + spineSpan * 0.68)} ${round(yBase + amp * dir)} ${round(x + spineSpan * 0.8)} ${round(yBase)} ${round(x2)} ${round(yBase)} `;

    const barbDir = dir === -1 ? 1 : -1;
    const bx = x + spineSpan * 0.45;
    const by = yBase + amp * dir;
    d += `M ${round(bx)} ${round(by)} C ${round(bx - spineSpan * 0.1)} ${round(by + amp * 0.35 * barbDir)} ${round(bx - spineSpan * 0.18)} ${round(by + amp * 0.65 * barbDir)} ${round(bx - spineSpan * 0.26)} ${round(by + amp * 1.05 * barbDir)} `;
    d += `M ${round(bx)} ${round(by)} C ${round(bx + spineSpan * 0.05)} ${round(by + amp * 0.28 * barbDir)} ${round(bx + spineSpan * 0.12)} ${round(by + amp * 0.52 * barbDir)} ${round(bx + spineSpan * 0.18)} ${round(by + amp * 0.82 * barbDir)} `;
    x = x2;
  }
  return d.trim();
}

function oakLeafBlock(width, height, style) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.14;
  const lobes = 5;
  let d = `M ${round(cx)} ${round(cy + r * 2.8)} `;
  for (let i = 0; i < lobes; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / lobes;
    const a2 = a + Math.PI / lobes;
    const ox = cx + Math.cos(a) * r * 2.4;
    const oy = cy + Math.sin(a) * r * 2.8;
    const mx = cx + Math.cos(a2) * r * 1.1;
    const my = cy + Math.sin(a2) * r * 1.1;
    d += `Q ${round(mx)} ${round(my)} ${round(ox)} ${round(oy)} `;
  }
  d += `Q ${round(cx)} ${round(cy)} ${round(cx)} ${round(cy + r * 2.8)}`;
  const stem = `M ${round(cx)} ${round(cy + r * 1.4)} C ${round(cx - r * 0.35)} ${round(cy + r * 2.6)} ${round(cx - r * 0.25)} ${round(cy + r * 3.6)} ${round(cx)} ${round(cy + r * 4.5)}`;
  return `${d} ${stem}`;
}

function blockMedallion(width, height, family, style, blockType) {
  if (family === 'feather') {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.2;
    let d = `M ${round(cx)} ${round(cy - radius)} `;
    for (let i = 0; i < 4; i += 1) {
      const a0 = -Math.PI / 2 + i * Math.PI / 2;
      const a1 = a0 + Math.PI / 2;
      const x1 = cx + Math.cos(a1) * radius;
      const y1 = cy + Math.sin(a1) * radius;
      const mx = cx + Math.cos(a0 + Math.PI / 4) * radius * 1.45;
      const my = cy + Math.sin(a0 + Math.PI / 4) * radius * 1.45;
      d += `Q ${round(mx)} ${round(my)} ${round(x1)} ${round(y1)} `;
    }
    d += `M ${round(cx - radius * 0.9)} ${round(cy)} Q ${round(cx)} ${round(cy - radius * 0.9)} ${round(cx + radius * 0.9)} ${round(cy)} Q ${round(cx)} ${round(cy + radius * 0.9)} ${round(cx - radius * 0.9)} ${round(cy)}`;
    return d;
  }
  if (family === 'vine') return oakLeafBlock(width, height, style);
  if (blockType === 'double' || blockType === 'drunkard') {
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) * 0.26;
    return `M ${round(cx - r)} ${round(cy)} A ${round(r)} ${round(r)} 0 0 1 ${round(cx)} ${round(cy - r)} A ${round(r)} ${round(r)} 0 0 1 ${round(cx + r)} ${round(cy)} A ${round(r)} ${round(r)} 0 0 1 ${round(cx)} ${round(cy + r)} A ${round(r)} ${round(r)} 0 0 1 ${round(cx - r)} ${round(cy)}`;
  }
  return leafChainStrip(width * 0.72, height * 0.52, width * 0.14, style, false);
}

function borderFrame(width, height, style, family) {
  const inset = clamp(width * 0.08, 28, 70);
  const topY = inset;
  const bottomY = height - inset;
  const leftX = inset;
  const rightX = width - inset;

  const top = stripForFamily(width - inset * 2, topY, 0, style, family);
  const bottom = stripForFamily(width - inset * 2, bottomY, 0, style, family === 'feather' ? 'ribbon' : family);
  const left = verticalStrip(leftX, height - inset * 2, 0, style, family);
  const right = verticalStrip(rightX, height - inset * 2, 0, style, family);
  return [
    `<g transform="translate(${round(inset)},0)">${makePath(top)}</g>`,
    `<g transform="translate(${round(inset)},0)">${makePath(bottom)}</g>`,
    `<g transform="translate(0,${round(inset)})">${makePath(left)}</g>`,
    `<g transform="translate(0,${round(inset)})">${makePath(right)}</g>`,
  ].join('');
}

function verticalStrip(xBase, height, inset, style, family) {
  const span = clamp(style.span, 70, 140);
  const repeats = Math.max(3, Math.floor((height - inset * 2) / span));
  let y = inset;
  let d = `M ${round(xBase)} ${round(y)} `;
  for (let i = 0; i < repeats; i += 1) {
    const dir = i % 2 === 0 ? -1 : 1;
    const amp = clamp(style.amp, 25, 65);
    if (family === 'clamshell') {
      y += span;
      d += `A ${round(span * 0.42)} ${round(span * 0.42)} 0 0 ${dir > 0 ? 1 : 0} ${round(xBase)} ${round(y)} `;
    } else {
      d += `Q ${round(xBase + amp * dir)} ${round(y + span * 0.45)} ${round(xBase)} ${round(y + span)} `;
      y += span;
    }
  }
  return d.trim();
}

function stripForFamily(width, yBase, inset, style, family) {
  switch (family) {
    case 'clamshell':
      return clamshellStrip(width, yBase, inset, style);
    case 'ribbon':
      return ribbonStrip(width, yBase, inset, style);
    case 'argyle':
      return argyleStrip(width, yBase, inset, style);
    case 'feather':
      return featherStrip(width, yBase, inset, style);
    case 'vine':
      return vineStrip(width, yBase, inset, style);
    case 'spiral':
      return spiralStrip(width, yBase, inset, style);
    case 'leaf':
    default:
      return leafChainStrip(width, yBase, inset, style, false);
  }
}

function generateEdge(params, width, height, style) {
  const family = style.family;
  const y = height / 2;
  const d = family === 'clamshell' && (params.motifs || []).some((m) => m === 'Baptist Fan')
    ? baptistFanStrip(width, y, style.inset, style)
    : stripForFamily(width, y, style.inset, style, family);
  return makePath(d);
}

function generateBorder(params, width, height, style) {
  return borderFrame(width, height, style, style.family);
}

function generateBlock(params, width, height, style) {
  const d = blockMedallion(width, height, style.family, style, params.blockType);
  return makePath(d);
}

export function generateSVG(params = {}) {
  const width = clamp((params.sW || 11.75) * DPI, 240, 1128);
  const height = clamp((params.sH || 11.75) * DPI, 240, 2280);
  const style = styleFromParams(params);

  let body = '';
  if (params.layout === 'border') {
    body = generateBorder(params, width, height, style);
  } else if (params.layout === 'block') {
    body = generateBlock(params, width, height, style);
  } else {
    body = generateEdge(params, width, height, style);
  }

  return wrapSvg({
    width,
    height,
    body,
    title: `${(params.motifs || ['Custom']).join(', ')} ${params.layout || 'edge'} stencil`,
    plastic: params.stencil === 'plastic',
  });
}

export function thumbnailSVG(item) {
  const family = item?.style === 'feather' ? 'feather'
    : item?.style === 'floral' ? 'vine'
    : item?.style === 'geometric' ? 'argyle'
    : item?.style === 'modern' ? 'ribbon'
    : 'clamshell';

  const params = {
    layout: item?.layout || 'edge',
    motifs: [family === 'vine' ? 'Leaves' : family === 'argyle' ? 'Geometric' : family === 'clamshell' ? 'Clamshell' : family === 'feather' ? 'Feathers' : 'Waves'],
    stencil: 'silk',
    sW: 4.4,
    sH: 2.4,
    complexity: 2,
    machine: 'longarm',
    minGap: 0.75,
    maxGap: 0.75,
    variableDensity: false,
    blockType: 'ohio',
  };
  return generateSVG(params);
}
