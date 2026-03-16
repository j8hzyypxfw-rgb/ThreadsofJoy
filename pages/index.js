import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  MOTIFS,
  SOURCES,
  BLOCKS,
  CATALOG,
  USERS,
  generateSVG,
  thumbnailSVG,
} from '../lib/stencil';

const SUGGESTIONS = [
  { title: 'Feather Plume Edge to Edge', sub: 'Flowing feathers complement geometric piecing', motif: 'Feathers', layout: 'edge' },
  { title: 'Dense Baptist Fan', sub: 'Classic allover creates rich texture contrast', motif: 'Baptist Fan', layout: 'edge' },
  { title: 'Organic Stipple', sub: 'Dense stipple makes star points pop forward', motif: 'Stipple', layout: 'edge' },
  { title: 'Floral Vine Border', sub: 'Flowing vines frame the quilt with romance', motif: 'Floral', layout: 'border' },
  { title: 'Geometric Argyle Edge', sub: 'Clean diamonds add structured movement', motif: 'Geometric', layout: 'edge' },
];

const COMPLEXITY_LABELS = ['', 'Simple', 'Moderate', 'Complex', 'Heirloom'];

export default function Home() {
  const [tab, setTab] = useState('catalog');
  const [activeUser, setActiveUser] = useState('julie');
  const [layout, setLayout] = useState('edge');
  const [fmt, setFmt] = useState('svg');
  const [stencilType, setStencilType] = useState('plastic');
  const [motifs, setMotifs] = useState(['Ribbon Candy']);
  const [sources, setSources] = useState([]);
  const [sW, setSW] = useState(11.75);
  const [sH, setSH] = useState(11.75);
  const [borderWidth, setBorderWidth] = useState(6);
  const [cornerTreat, setCornerTreat] = useState('none');
  const [blockType, setBlockType] = useState('ohio');
  const [customMotif, setCustomMotif] = useState('');
  const [complexity, setComplexity] = useState(2);
  const [machine, setMachine] = useState('longarm');
  const [minGap, setMinGap] = useState(0.5);
  const [maxGap, setMaxGap] = useState(1.0);
  const [variableDensity, setVariableDensity] = useState(false);
  const [generatedSVG, setGeneratedSVG] = useState('');
  const [designParams, setDesignParams] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [catStyle, setCatStyle] = useState('');
  const [catLayout, setCatLayout] = useState('');
  const [uploadedImg, setUploadedImg] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [presetId, setPresetId] = useState('');

  useEffect(() => {
    const params = buildParams();
    setDesignParams(params);
    setGeneratedSVG(generateSVG(params));
  }, [layout, stencilType, motifs, sW, sH, borderWidth, blockType, complexity, machine, minGap, maxGap, variableDensity, presetId]);

  const buildParams = () => ({
    layout,
    motifs: motifs.length ? motifs : (customMotif ? [customMotif] : ['Ribbon Candy']),
    stencil: stencilType,
    sW,
    sH,
    borderWidth,
    blockType,
    complexity,
    machine,
    minGap,
    maxGap: variableDensity ? maxGap : minGap,
    variableDensity,
    presetId,
  });

  const styleOptions = useMemo(() => Array.from(new Set(CATALOG.map((d) => d.style))), []);
  const layoutOptions = useMemo(() => Array.from(new Set(CATALOG.map((d) => d.layout))), []);

  const filteredCatalog = useMemo(() => CATALOG.filter((d) => {
    return (!catStyle || d.style === catStyle) && (!catLayout || d.layout === catLayout);
  }), [catStyle, catLayout]);

  const loadFromCatalog = (item) => {
    setPresetId(item.id);
    setLayout(item.layout);
    setMotifs([familyToMotif(item.family)]);
    setSources([item.source]);
    setTab('preview');
  };

  const familyToMotif = (family) => {
    switch (family) {
      case 'baptistFan': return 'Baptist Fan';
      case 'ribbonCandy': return 'Ribbon Candy';
      case 'clamshell': return 'Clamshell';
      case 'leafChain': return 'Floral';
      case 'argyle': return 'Geometric';
      case 'feather': return 'Feathers';
      case 'vine': return 'Floral';
      case 'stipple': return 'Stipple';
      default: return 'Ribbon Candy';
    }
  };

  const handleDownload = () => {
    if (!generatedSVG) return;
    const blob = new Blob([generatedSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threads-of-joy-${presetId || motifs[0].toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImg(ev.target?.result || null);
      setSuggestions(SUGGESTIONS);
    };
    reader.readAsDataURL(file);
  };

  const navTabs = [
    { id: 'design', label: 'Design Studio' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'favorites', label: `Favorites (${favorites.length})` },
    { id: 'upload', label: 'Photo Assist' },
    { id: 'preview', label: 'Preview & Export' },
  ];

  const shell = {
    bg: '#f5f5f7',
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d8d8e0', borderRadius: 10, fontSize: 14, fontFamily: 'Georgia, serif', background: '#fff' },
    small: { fontSize: 12, color: '#6b7280' },
    btn: { border: '1px solid #d8d8e0', borderRadius: 10, padding: '10px 14px', background: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif' },
    btnPrimary: { border: '1px solid #7c3aed', borderRadius: 10, padding: '10px 14px', background: '#7c3aed', color: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif' },
  };

  return (
    <>
      <Head>
        <title>Threads of Joy — Quilting Stencils & Tools</title>
      </Head>
      <div style={{ minHeight: '100vh', background: shell.bg, color: '#111827', fontFamily: 'Georgia, serif' }}>
        <div style={{ background: 'linear-gradient(180deg, #31114d 0%, #220733 100%)', color: '#fff', padding: '16px 24px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
            {Object.entries(USERS).map(([key, user]) => (
              <button key={key} onClick={() => setActiveUser(key)} style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: activeUser === key ? 'rgba(255,255,255,0.12)' : 'transparent', color: '#fff', padding: '8px 14px', cursor: 'pointer' }}>
                <span style={{ color: user.color, marginRight: 8 }}>●</span>{user.label}'s Studio
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', paddingBottom: 10 }}>
            <div style={{ letterSpacing: '.28em', fontSize: 11, textTransform: 'uppercase', opacity: 0.75 }}>Design Sources</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 13, opacity: 0.9 }}>
              {SOURCES.map((s) => <span key={s}>{s}</span>)}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: 8, padding: '0 12px' }}>
          {navTabs.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ border: 'none', background: 'transparent', padding: '14px 16px', cursor: 'pointer', color: tab === n.id ? '#7c3aed' : '#6b7280', borderBottom: tab === n.id ? '2px solid #7c3aed' : '2px solid transparent', fontSize: 15 }}>
              {n.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
          {tab === 'catalog' && (
            <div>
              <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                <select value={catStyle} onChange={(e) => setCatStyle(e.target.value)} style={shell.input}>
                  <option value="">All Styles</option>
                  {styleOptions.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
                <select value={catLayout} onChange={(e) => setCatLayout(e.target.value)} style={shell.input}>
                  <option value="">All Layouts</option>
                  {layoutOptions.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ ...shell.small, marginBottom: 18 }}>{filteredCatalog.length} designs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {filteredCatalog.map((item) => (
                  <button key={item.id} onClick={() => loadFromCatalog(item)} style={{ ...shell.card, textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ background: '#fafafa', borderRadius: 10, overflow: 'hidden', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }} dangerouslySetInnerHTML={{ __html: thumbnailSVG(item) }} />
                    <div style={{ fontSize: 24, marginBottom: 6, fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>{item.source}</div>
                    <div>
                      {item.tags.map((tag) => (
                        <span key={tag} style={{ display: 'inline-block', marginRight: 6, marginTop: 4, padding: '2px 8px', borderRadius: 999, background: '#f3e8ff', color: '#7c3aed', fontSize: 11 }}>{tag}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'design' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 20 }}>
              <div style={shell.card}>
                <div style={{ fontSize: 22, marginBottom: 14 }}>Design Studio</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <select value={layout} onChange={(e) => setLayout(e.target.value)} style={shell.input}>
                    <option value="edge">Edge to Edge</option>
                    <option value="border">Border</option>
                    <option value="block">Block</option>
                  </select>
                  <select value={fmt} onChange={(e) => setFmt(e.target.value)} style={shell.input}>
                    <option value="svg">SVG File</option>
                    <option value="pdf">PDF File</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {MOTIFS.map((m) => (
                      <button key={m} onClick={() => { setMotifs([m]); setPresetId(''); }} style={{ ...shell.btn, background: motifs.includes(m) ? '#f3e8ff' : '#fff', borderColor: motifs.includes(m) ? '#7c3aed' : '#d8d8e0', color: motifs.includes(m) ? '#7c3aed' : '#374151' }}>{m}</button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>Stencil Width<input type="number" value={sW} min="1" step="0.25" onChange={(e) => setSW(Number(e.target.value))} style={shell.input} /></label>
                    <label>Stencil Height<input type="number" value={sH} min="1" step="0.25" onChange={(e) => setSH(Number(e.target.value))} style={shell.input} /></label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label>Border Width<input type="number" value={borderWidth} min="1" step="0.25" onChange={(e) => setBorderWidth(Number(e.target.value))} style={shell.input} /></label>
                    <label>Complexity<input type="range" value={complexity} min="1" max="4" onChange={(e) => setComplexity(Number(e.target.value))} style={{ width: '100%' }} /><div style={shell.small}>{COMPLEXITY_LABELS[complexity]}</div></label>
                  </div>
                  <label>Block Pattern<select value={blockType} onChange={(e) => setBlockType(e.target.value)} style={shell.input}>{Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                  <label>Machine<select value={machine} onChange={(e) => setMachine(e.target.value)} style={shell.input}><option value="longarm">Longarm</option><option value="domestic">Domestic</option></select></label>
                </div>
              </div>
              <div style={shell.card}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>Current Preview</div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fafafa', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: generatedSVG }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={() => setTab('preview')} style={shell.btnPrimary}>Open Preview</button>
                  <button onClick={handleDownload} style={shell.btn}>Download SVG</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'preview' && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={shell.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>Preview & Export</div>
                    <div style={shell.small}>Live SVG preview for the selected design family</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setTab('catalog')} style={shell.btn}>Back to Catalog</button>
                    <button onClick={handleDownload} style={shell.btnPrimary}>Download SVG</button>
                  </div>
                </div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: generatedSVG }} />
              </div>
              <div style={shell.card}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12, color: '#6b7280' }}>{JSON.stringify(buildParams(), null, 2)}</pre>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={shell.card}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>Photo Assist</div>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} style={shell.input} />
                {uploadedImg && <img src={uploadedImg} alt="Uploaded reference" style={{ width: '100%', marginTop: 14, borderRadius: 12 }} />}
              </div>
              <div style={shell.card}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>Suggestions</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {suggestions.map((s, idx) => (
                    <button key={s.title} onClick={() => setSelectedSuggestion(idx)} style={{ ...shell.btn, textAlign: 'left', background: idx === selectedSuggestion ? '#f3e8ff' : '#fff' }}>
                      <div style={{ fontWeight: 700 }}>{s.title}</div>
                      <div style={shell.small}>{s.sub}</div>
                    </button>
                  ))}
                </div>
                {selectedSuggestion !== null && (
                  <button onClick={() => {
                    const s = suggestions[selectedSuggestion];
                    setMotifs([s.motif]);
                    setLayout(s.layout);
                    setPresetId('');
                    setTab('preview');
                  }} style={{ ...shell.btnPrimary, marginTop: 14 }}>Use Suggestion</button>
                )}
              </div>
            </div>
          )}

          {tab === 'favorites' && (
            <div style={shell.card}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>Favorites</div>
              <div style={shell.small}>Favorites storage is left intact. This page is a visual placeholder until you reconnect the save workflow.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
