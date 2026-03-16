export const USERS = {
  julie: { label: 'Julie', color: '#f0c36e' },
  mom: { label: 'Mom', color: '#d6a6ff' },
  kim: { label: 'Kim', color: '#9ee7ff' },
};

export const SOURCES = [
  'Full Line Stencil',
  'Urban Elementz',
  'Fancy Creations',
  'Blocks / Corners',
  'Digital / Paper',
];

export const BLOCKS = {
  ohio: 'Ohio Star',
  ninepatch: 'Nine Patch',
  medallion: 'Medallion',
};

export const MOTIFS = [
  'Baptist Fan',
  'Ribbon Candy',
  'Clamshell',
  'Leaf Chain',
  'Argyle',
  'Feathers',
  'Floral',
  'Geometric',
  'Stipple',
];

export const CATALOG = [
  {
    id: 'baptist-fan-wave',
    name: 'Baptist Fan Wave',
    source: 'Urban Elementz',
    layout: 'border',
    style: 'traditional',
    family: 'baptistFan',
    params: { repeat: 6, radius: 28 },
    tags: ['border', 'traditional'],
  },
  {
    id: 'simple-ribbon-candy-border',
    name: 'Simple Ribbon Candy Border',
    source: 'Digital / Paper',
    layout: 'border',
    style: 'romantic',
    family: 'ribbonCandy',
    params: { repeat: 4, step: 58, amp: 18 },
    tags: ['border', 'romantic'],
  },
  {
    id: 'classic-clamshell',
    name: 'Classic Clamshell',
    source: 'Urban Elementz',
    layout: 'edge',
    style: 'traditional',
    family: 'clamshell',
    params: { repeat: 6, radius: 26 },
    tags: ['edge', 'traditional'],
  },
  {
    id: 'modern-leaf-trail',
    name: 'Modern Leaf Trail',
    source: 'Digital / Paper',
    layout: 'edge',
    style: 'romantic',
    family: 'leafChain',
    params: { repeat: 5, width: 34, height: 30 },
    tags: ['edge', 'romantic'],
  },
  {
    id: 'diamond-argyle',
    name: 'Diamond Argyle',
    source: 'Urban Elementz',
    layout: 'edge',
    style: 'geometric',
    family: 'argyle',
    params: { repeat: 4, cell: 42 },
    tags: ['edge', 'geometric'],
  },
  {
    id: 'feather-spine-plume',
    name: 'Feather Spine Plume',
    source: 'Full Line Stencil',
    layout: 'border',
    style: 'elegant',
    family: 'feather',
    params: { repeat: 5, step: 52, amp: 18 },
    tags: ['border', 'elegant'],
  },
  {
    id: 'vine-scroll-border',
    name: 'Floral Vine Scroll',
    source: 'Digital / Paper',
    layout: 'border',
    style: 'romantic',
    family: 'vine',
    params: { repeat: 4, step: 64, amp: 16 },
    tags: ['border', 'romantic'],
  },
];

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function familyFromParams(params = {}) {
  if (params.family) return params.family;
  const motif = (params.motifs && params.motifs[0]) || '';
  switch (motif) {
    case 'Baptist Fan': return 'baptistFan';
    case 'Ribbon Candy': return 'ribbonCandy';
    case 'Clamshell': return 'clamshell';
    case 'Leaf Chain':
    case 'Floral': return 'leafChain';
    case 'Argyle':
    case 'Geometric': return 'argyle';
    case 'Feathers': return 'feather';
    case 'Stipple': return 'stipple';
    default: return 'ribbonCandy';
  }
}

function wrapSvg(pathD, width = 1200, height = 260, strokeWidth = 4) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="white"/>
  <path d="${pathD}" fill="none" stroke="#111" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

function wrapThumb(pathD) {
  return wrapSvg(pathD, 240, 100, 3);
}

function genBaptistFan({ repeat = 8, radius = 34, startX = 16, y = 72 } = {}) {
  let x = startX;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < repeat; i += 1) {
    x += radius * 2;
    d += ` A ${radius} ${radius} 0 0 1 ${x} ${y}`;
  }
  return d;
}

function genClamshell({ repeat = 8, radius = 34, startX = 16, y = 78 } = {}) {
  let x = startX;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < repeat; i += 1) {
    x += radius * 2;
    d += ` A ${radius} ${radius} 0 0 0 ${x} ${y}`;
  }
  return d;
}

function genRibbonCandy({ repeat = 6, step = 150, amp = 40, startX = 18, midY = 130 } = {}) {
  let x = startX;
  let d = `M ${x} ${midY}`;
  for (let i = 0; i < repeat; i += 1) {
    const x1 = x + step / 2;
    const x2 = x + step;
    const y1 = i % 2 === 0 ? midY - amp : midY + amp;
    d += ` C ${x + step * 0.18} ${midY} ${x1 - step * 0.18} ${y1} ${x1} ${y1}`;
    d += ` C ${x1 + step * 0.18} ${y1} ${x + step * 0.82} ${midY} ${x2} ${midY}`;
    x = x2;
  }
  return d;
}

function genLeafChain({ repeat = 8, width = 84, height = 74, startX = 16, midY = 82 } = {}) {
  let x = startX;
  let d = '';
  for (let i = 0; i < repeat; i += 1) {
    const l = x;
    const r = x + width;
    const t = x + width / 2;
    const b = midY + height;
    d += ` M ${l} ${midY} Q ${t} ${midY - height} ${r} ${midY} L ${t} ${b} Z`;
    x += width;
  }
  return d.trim();
}

function genArgyle({ repeat = 6, cell = 80, startX = 16, midY = 130 } = {}) {
  let x = startX;
  let d = `M ${x} ${midY}`;
  for (let i = 0; i < repeat; i += 1) {
    d += ` L ${x + cell / 2} ${midY - cell / 2}`;
    d += ` L ${x + cell} ${midY}`;
    d += ` L ${x + 1.5 * cell} ${midY + cell / 2}`;
    d += ` L ${x + 2 * cell} ${midY}`;
    x += cell * 2;
  }
  return d;
}

function genFeather({ repeat = 7, step = 90, amp = 34, startX = 22, midY = 130 } = {}) {
  let d = `M ${startX} ${midY}`;
  let x = startX;
  for (let i = 0; i < repeat; i += 1) {
    const x2 = x + step;
    const cx = x + step / 2;
    const y = i % 2 === 0 ? midY - amp : midY + amp;
    d += ` Q ${cx} ${y} ${x2} ${midY}`;
    d += ` M ${cx} ${midY}`;
    d += ` Q ${cx - 16} ${y} ${cx - 26} ${y + (i % 2 === 0 ? -18 : 18)}`;
    d += ` M ${cx} ${midY}`;
    d += ` Q ${cx + 16} ${y} ${cx + 26} ${y + (i % 2 === 0 ? -18 : 18)}`;
    d += ` M ${x2} ${midY}`;
    x = x2;
  }
  return d;
}

function genVine({ repeat = 6, step = 120, amp = 28, startX = 18, midY = 128 } = {}) {
  let x = startX;
  let d = `M ${x} ${midY}`;
  for (let i = 0; i < repeat; i += 1) {
    const x2 = x + step;
    const cx = x + step / 2;
    const y = i % 2 === 0 ? midY - amp : midY + amp;
    d += ` Q ${cx} ${y} ${x2} ${midY}`;
    const leafX = x + step * 0.58;
    const leafY = i % 2 === 0 ? midY - amp * 0.6 : midY + amp * 0.6;
    const tipY = i % 2 === 0 ? leafY - 28 : leafY + 28;
    d += ` M ${leafX - 16} ${leafY}`;
    d += ` Q ${leafX} ${leafY - (i % 2 === 0 ? 22 : -22)} ${leafX + 16} ${leafY}`;
    d += ` L ${leafX} ${tipY} Z`;
    d += ` M ${x2} ${midY}`;
    x = x2;
  }
  return d;
}

function genStipple({ repeat = 24, step = 42, amp = 18, startX = 18, midY = 130 } = {}) {
  let x = startX;
  let d = `M ${x} ${midY}`;
  for (let i = 0; i < repeat; i += 1) {
    const x1 = x + step / 2;
    const x2 = x + step;
    const y = i % 2 === 0 ? midY - amp : midY + amp;
    d += ` Q ${x1} ${y} ${x2} ${midY}`;
    x = x2;
  }
  return d;
}

function buildPath(params = {}, thumb = false) {
  const family = familyFromParams(params);
  if (family === 'baptistFan') return genBaptistFan(thumb ? params : {
    repeat: Math.max(3, Math.round(num(params.sW, 11.75) / 1.4)),
    radius: num(params.layout === 'border' ? params.borderWidth * 6 : 36, 36),
    y: 160,
    startX: 24,
  });
  if (family === 'clamshell') return genClamshell(thumb ? params : {
    repeat: Math.max(3, Math.round(num(params.sW, 11.75) / 1.4)),
    radius: num(params.layout === 'border' ? params.borderWidth * 6 : 34, 34),
    y: 172,
    startX: 24,
  });
  if (family === 'leafChain') return genLeafChain(thumb ? params : {
    repeat: Math.max(4, Math.round(num(params.sW, 11.75) / 1.2)),
    width: num(params.layout === 'border' ? params.borderWidth * 10 : 86, 86),
    height: num(params.layout === 'border' ? params.borderWidth * 7 : 74, 74),
    startX: 16,
    midY: 90,
  });
  if (family === 'argyle') return genArgyle(thumb ? params : {
    repeat: Math.max(3, Math.round(num(params.sW, 11.75) / 2)),
    cell: num(params.layout === 'border' ? params.borderWidth * 8 : 82, 82),
    startX: 24,
    midY: 130,
  });
  if (family === 'feather') return genFeather(thumb ? params : {
    repeat: Math.max(4, Math.round(num(params.sW, 11.75) / 1.5)),
    step: num(params.layout === 'border' ? params.borderWidth * 12 : 94, 94),
    amp: num(params.complexity, 2) * 10 + 12,
    startX: 20,
    midY: 130,
  });
  if (family === 'vine') return genVine(thumb ? params : {
    repeat: Math.max(4, Math.round(num(params.sW, 11.75) / 1.7)),
    step: num(params.layout === 'border' ? params.borderWidth * 12 : 100, 100),
    amp: num(params.complexity, 2) * 8 + 12,
    startX: 18,
    midY: 130,
  });
  if (family === 'stipple') return genStipple(thumb ? params : {
    repeat: Math.max(10, Math.round(num(params.sW, 11.75) * 2)),
    step: 40,
    amp: 16 + num(params.complexity, 2) * 2,
    startX: 20,
    midY: 130,
  });
  return genRibbonCandy(thumb ? params : {
    repeat: Math.max(4, Math.round(num(params.sW, 11.75) / 1.6)),
    step: num(params.layout === 'border' ? params.borderWidth * 15 : 140, 140),
    amp: num(params.complexity, 2) * 10 + 18,
    startX: 18,
    midY: 130,
  });
}

export function generateSVG(params = {}) {
  return wrapSvg(buildPath(params, false), 1200, 260, 4);
}

export function thumbnailSVG(itemOrParams = {}) {
  const params = itemOrParams.params ? { family: itemOrParams.family, ...itemOrParams.params } : itemOrParams;
  return wrapThumb(buildPath(params, true));
}
