import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { MOTIFS, SOURCES, BLOCKS, CATALOG, USERS, generateSVG, thumbnailSVG } from '../lib/stencil'

const SUGGESTIONS = [
  { title: 'Feather Plume Edge to Edge', sub: 'Flowing feathers complement geometric piecing', motif: 'Feather Spine', layout: 'edge' },
  { title: 'Dense Baptist Fan', sub: 'Classic allover creates rich texture contrast', motif: 'Baptist Fan', layout: 'edge' },
  { title: 'Floral Vine Border', sub: 'Flowing vines frame the quilt with romance', motif: 'Floral Vine', layout: 'border' },
  { title: 'Modern Ribbon Candy', sub: 'Smooth border loops with easy spacing', motif: 'Ribbon Candy', layout: 'border' },
]

const COMPLEXITY_LABELS = ['', 'Simple', 'Moderate', 'Complex', 'Heirloom']

export default function Home() {
  const [tab, setTab] = useState('catalog')
  const [activeUser, setActiveUser] = useState('julie')
  const [layout, setLayout] = useState('border')
  const [fmt, setFmt] = useState('svg')
  const [stencilType, setStencilType] = useState('plastic')
  const [motifs, setMotifs] = useState(['Ribbon Candy'])
  const [sources, setSources] = useState([])
  const [sW, setSW] = useState(11.75)
  const [sH, setSH] = useState(11.75)
  const [borderWidth, setBorderWidth] = useState(6)
  const [cornerTreat, setCornerTreat] = useState('none')
  const [blockType, setBlockType] = useState('ohio')
  const [complexity, setComplexity] = useState(2)
  const [machine, setMachine] = useState('longarm')
  const [minGap, setMinGap] = useState(0.5)
  const [maxGap, setMaxGap] = useState(1.0)
  const [variableDensity, setVariableDensity] = useState(false)
  const [generatedSVG, setGeneratedSVG] = useState('')
  const [designParams, setDesignParams] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [catStyle, setCatStyle] = useState('')
  const [catLayout, setCatLayout] = useState('border')
  const [uploadedImg, setUploadedImg] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [presetId, setPresetId] = useState('simple-ribbon-candy-border')
  const previewRef = useRef(null)

  useEffect(() => {
    const params = buildParams()
    setDesignParams(params)
    setGeneratedSVG(generateSVG(params))
  }, [layout, stencilType, motifs, sW, sH, borderWidth, blockType, complexity, machine, minGap, maxGap, variableDensity, presetId])

  useEffect(() => {
    if (generatedSVG && previewRef.current) previewRef.current.innerHTML = generatedSVG
  }, [generatedSVG])

  const buildParams = () => ({
    layout,
    motifs,
    presetId,
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
  })

  const handleGenerate = () => {
    const params = buildParams()
    setDesignParams(params)
    setGeneratedSVG(generateSVG(params))
    setTab('preview')
  }

  const handleDownload = () => {
    if (!generatedSVG) return
    const blob = new Blob([generatedSVG], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threads-of-joy-${presetId || layout}-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImg(ev.target.result)
      setSuggestions(SUGGESTIONS)
      setTab('upload')
    }
    reader.readAsDataURL(f)
  }

  const handleGenerateFromSuggestion = () => {
    if (selectedSuggestion === null) return
    const s = SUGGESTIONS[selectedSuggestion]
    setMotifs([s.motif])
    setLayout(s.layout)
    setPresetId('')
    setTimeout(handleGenerate, 0)
  }

  const loadFromCatalog = (item) => {
    setLayout(item.layout)
    setMotifs([titleCase(item.family)])
    setSources([item.source])
    setPresetId(item.id)
    setTab('preview')
  }

  const filteredCatalog = CATALOG.filter((d) => (!catStyle || d.family === catStyle) && (!catLayout || d.layout === catLayout))

  const navTabs = [
    { id: 'design', label: 'Design Studio' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'favorites', label: `Favorites (${favorites.length})` },
    { id: 'upload', label: 'Photo Assist' },
    { id: 'preview', label: 'Preview & Export' },
  ]

  return (
    <>
      <Head>
        <title>Threads of Joy — Quilting Stencils & Tools</title>
      </Head>

      <div style={{ minHeight: '100vh', background: '#f8f7fb', fontFamily: 'Georgia, serif', color: '#1f2937' }}>
        <div style={{ background: 'linear-gradient(180deg,#2a063c 0%, #190427 100%)', color: 'white', padding: '16px 0 18px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
              {Object.entries(USERS).map(([key, u]) => (
                <button key={key} onClick={() => setActiveUser(key)} style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)', background: activeUser === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: 'white', padding: '7px 16px', cursor: 'pointer' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: u.color, marginRight: 8 }} />
                  {u.label}'s Studio
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', letterSpacing: '0.22em', fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Design sources &nbsp; {SOURCES.join('   ')}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 18px', display: 'flex', gap: 18, overflowX: 'auto' }}>
            {navTabs.map((n) => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{ padding: '14px 2px', border: 'none', background: 'transparent', fontSize: 13, color: tab === n.id ? '#7c3aed' : '#6b7280', borderBottom: tab === n.id ? '2px solid #7c3aed' : '2px solid transparent', fontWeight: tab === n.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 24 }}>
          {tab === 'catalog' && (
            <>
              <div style={{ display: 'grid', gap: 8, maxWidth: 900, margin: '0 auto 18px' }}>
                <select value={catStyle} onChange={(e) => setCatStyle(e.target.value)} style={selectStyle}>
                  <option value="">All Styles</option>
                  {[...new Set(CATALOG.map((x) => x.family))].map((style) => <option key={style} value={style}>{titleCase(style)}</option>)}
                </select>
                <select value={catLayout} onChange={(e) => setCatLayout(e.target.value)} style={selectStyle}>
                  <option value="">All Layouts</option>
                  <option value="border">Border</option>
                  <option value="edge">Edge to Edge</option>
                  <option value="block">Block</option>
                </select>
                <div style={{ color: '#9ca3af', fontSize: 12 }}>{filteredCatalog.length} designs</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(212px, 1fr))', gap: 14 }}>
                {filteredCatalog.map((item) => (
                  <button key={item.id} onClick={() => loadFromCatalog(item)} style={{ textAlign: 'left', border: '1px solid #e5e7eb', borderRadius: 14, background: 'white', padding: 12, cursor: 'pointer' }}>
                    <div dangerouslySetInnerHTML={{ __html: thumbnailSVG(item) }} />
                    <div style={{ fontWeight: 700, marginTop: 8, color: '#111827' }}>{item.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>{item.source}</div>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {item.tags.map((tag) => <span key={tag} style={tagStyle}>{tag}</span>)}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'design' && (
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Quilting Layout</label>
                  <div style={toggleWrap}>
                    {[['edge', 'Edge to Edge'], ['border', 'Border'], ['block', 'Block']].map(([value, text]) => (
                      <button key={value} onClick={() => setLayout(value)} style={toggleButton(layout === value)}>{text}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Output Format</label>
                  <div style={toggleWrap}>
                    {[['svg', 'SVG File'], ['pdf', 'PDF File']].map(([value, text]) => (
                      <button key={value} onClick={() => setFmt(value)} style={toggleButton(fmt === value)}>{text}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <label style={labelStyle}>Motifs</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {MOTIFS.map((m) => (
                    <button key={m} onClick={() => { setMotifs([m]); setPresetId('') }} style={chipStyle(motifs.includes(m))}>{m}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <Field label="Stencil Type">
                  <select value={stencilType} onChange={(e) => setStencilType(e.target.value)} style={selectStyle}>
                    <option value="plastic">Plastic Stencil</option>
                    <option value="paper">Paper Pattern</option>
                  </select>
                </Field>
                <Field label="Block Pattern">
                  <select value={blockType} onChange={(e) => setBlockType(e.target.value)} style={selectStyle}>
                    {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </Field>
                <Field label="Complexity">
                  <input type="range" min="1" max="4" value={complexity} onChange={(e) => setComplexity(Number(e.target.value))} style={{ width: '100%' }} />
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{COMPLEXITY_LABELS[complexity]}</div>
                </Field>
              </div>

              <div style={{ marginTop: 18 }}>
                <button onClick={handleGenerate} style={primaryButton}>Generate Preview</button>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div style={cardStyle}>
              <label style={labelStyle}>Upload reference photo</label>
              <input type="file" accept="image/*" onChange={handleUpload} />
              {uploadedImg && <img src={uploadedImg} alt="uploaded reference" style={{ marginTop: 16, maxWidth: 320, borderRadius: 12, border: '1px solid #e5e7eb' }} />}
              {!!suggestions.length && (
                <div style={{ marginTop: 16 }}>
                  {suggestions.map((s, idx) => (
                    <label key={s.title} style={{ display: 'block', padding: '10px 0' }}>
                      <input type="radio" checked={selectedSuggestion === idx} onChange={() => setSelectedSuggestion(idx)} /> <strong>{s.title}</strong> <span style={{ color: '#6b7280' }}>{s.sub}</span>
                    </label>
                  ))}
                  <button onClick={handleGenerateFromSuggestion} style={primaryButton}>Use Suggestion</button>
                </div>
              )}
            </div>
          )}

          {tab === 'favorites' && (
            <div style={cardStyle}>
              <div style={{ color: '#6b7280' }}>Favorites are preserved in the current site. This replacement file keeps the tab and count so the design stays intact.</div>
            </div>
          )}

          {tab === 'preview' && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af' }}>Preview</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{CATALOG.find((x) => x.id === presetId)?.name || motifs[0]}</div>
                </div>
                <button onClick={handleDownload} style={primaryButton}>Download SVG</button>
              </div>
              <div ref={previewRef} style={{ border: '1px solid #e5e7eb', borderRadius: 16, background: 'white', padding: 14, overflowX: 'auto' }} />
              {designParams && <pre style={{ background: '#faf5ff', color: '#5b21b6', padding: 12, borderRadius: 12, fontSize: 12, marginTop: 12, overflowX: 'auto' }}>{JSON.stringify(designParams, null, 2)}</pre>}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function titleCase(value = '') {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (m) => m.toUpperCase()).trim()
}

function Field({ label, children }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>
}

const cardStyle = { background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }
const selectStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd6fe', borderRadius: 10, background: 'white', fontFamily: 'Georgia, serif' }
const labelStyle = { display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280' }
const tagStyle = { display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: '#f3e8ff', color: '#7c3aed', fontSize: 11 }
const toggleWrap = { display: 'flex', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }
const toggleButton = (active) => ({ flex: 1, padding: '10px 8px', border: 'none', background: active ? '#f3e8ff' : 'white', color: active ? '#6b21a8' : '#6b7280', cursor: 'pointer' })
const chipStyle = (active) => ({ padding: '6px 12px', borderRadius: 999, border: active ? '1px solid #9333ea' : '1px solid #e5e7eb', background: active ? '#f3e8ff' : '#f9fafb', color: active ? '#6b21a8' : '#6b7280', cursor: 'pointer' })
const primaryButton = { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 700 }
