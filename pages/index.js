import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { MOTIFS, SOURCES, BLOCKS, CATALOG, USERS, generateSVG, thumbnailSVG } from '../lib/stencil'

const SUGGESTIONS = [
  { title: 'Feather Plume Edge-to-Edge', sub: 'Flowing feathers complement geometric piecing beautifully', motif: 'feather', layout: 'edge' },
  { title: 'Dense Baptist Fan', sub: 'Classic allover creates rich texture contrast', motif: 'traditional', layout: 'edge' },
  { title: 'Feather Wreath on Blocks', sub: 'Medallion wreath anchors each block with elegance', motif: 'feather', layout: 'block' },
  { title: 'Organic Stipple Background', sub: 'Dense stipple recedes — makes star points pop forward', motif: 'modern', layout: 'edge' },
  { title: 'Floral Vine Border', sub: 'Flowing vines frame the quilt with romance', motif: 'floral', layout: 'border' },
  { title: 'Geometric Crosshatch', sub: 'Precise grid adds depth to solid background areas', motif: 'geometric', layout: 'edge' },
]

export default function Home() {
  const [tab, setTab] = useState('design')
  const [activeUser, setActiveUser] = useState('julie')
  const [layout, setLayout] = useState('edge')
  const [fmt, setFmt] = useState('svg')
  const [stencilType, setStencilType] = useState('plastic')
  const [motifs, setMotifs] = useState([])
  const [sources, setSources] = useState([])
  const [sW, setSW] = useState(11.75)
  const [sH, setSH] = useState(11.75)
  const [borderLen, setBorderLen] = useState(60)
  const [borderWidth, setBorderWidth] = useState(6)
  const [cornerTreat, setCornerTreat] = useState('none')
  const [blockType, setBlockType] = useState('ohio')
  const [customMotif, setCustomMotif] = useState('')
  const [generatedSVG, setGeneratedSVG] = useState('')
  const [generating, setGenerating] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [favLoading, setFavLoading] = useState(false)
  const [savingFav, setSavingFav] = useState(false)
  const [catStyle, setCatStyle] = useState('')
  const [catLayout, setCatLayout] = useState('')
  const [uploadedImg, setUploadedImg] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [designParams, setDesignParams] = useState(null)

  // Load favorites on mount
  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setFavLoading(true)
    try {
      const r = await fetch('/api/favorites')
      const data = await r.json()
      setFavorites(data.favorites || [])
    } catch { setFavorites([]) }
    setFavLoading(false)
  }

  const toggleMotif = (m) => setMotifs(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  const toggleSource = (s) => setSources(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const buildParams = () => ({
    layout, motifs: motifs.length ? motifs : (customMotif ? [customMotif] : ['Feathers']),
    stencil: stencilType, sW, sH, borderLen, borderWidth, blockType,
  })

  const handleGenerate = async () => {
    setGenerating(true)
    const params = buildParams()
    setDesignParams(params)
    try {
      const svg = generateSVG(params)
      setGeneratedSVG(svg)
      setTab('preview')
    } catch (e) { alert('Error generating stencil: ' + e.message) }
    setGenerating(false)
  }

  const handleSaveFavorite = async () => {
    if (!generatedSVG || !designParams) return
    setSavingFav(true)
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeUser,
          design: { ...designParams, svgPreview: generatedSVG.slice(0, 3000) }
        })
      })
      await fetchFavorites()
    } catch (e) { console.error(e) }
    setSavingFav(false)
  }

  const handleDeleteFavorite = async (id) => {
    try {
      await fetch(`/api/favorites?id=${id}`, { method: 'DELETE' })
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (e) { console.error(e) }
  }

  const handleDownload = () => {
    if (!generatedSVG) return
    const blob = new Blob([generatedSVG], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threads-of-joy-${layout}-${Date.now()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUpload = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => {
        setUploadedImg(ev.target.result)
        setSuggestions(SUGGESTIONS)
      }
      reader.readAsDataURL(f)
    } else {
      setUploadedImg(null)
      setSuggestions(SUGGESTIONS)
    }
  }

  const handleGenerateFromSuggestion = () => {
    if (selectedSuggestion === null) return
    const s = SUGGESTIONS[selectedSuggestion]
    setMotifs([s.motif])
    setLayout(s.layout)
    handleGenerate()
  }

  const loadFromCatalog = (item) => {
    setLayout(item.layout)
    setMotifs([item.style])
    setSources([item.source])
    setTab('design')
  }

  const loadFromFavorite = (fav) => {
    const d = fav.design
    setLayout(d.layout || 'edge')
    setMotifs(d.motifs || [])
    setStencilType(d.stencil || 'plastic')
    setSW(d.sW || 11.75)
    setSH(d.sH || 11.75)
    setBlockType(d.blockType || 'ohio')
    setTab('design')
  }

  const filteredCatalog = CATALOG.filter(d =>
    (!catStyle || d.style === catStyle) && (!catLayout || d.layout === catLayout)
  )

  const userColor = USERS[activeUser].color

  return (
    <>
      <Head>
        <title>Threads of Joy — Quilting Stencils & Tools</title>
        <meta name="description" content="Machine quilting stencils and tools for Julie, Mom, and Kim. Continuous-line, competition grade, chalk pounce." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='26' font-size='26'>🧵</text></svg>" />
      </Head>

      {/* ══════════════════════════════════════════ HERO */}
      <header style={{ background: '#1a0a2e', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 15% 60%, rgba(180,100,220,0.18) 0%,transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(201,169,110,0.12) 0%,transparent 50%)' }} />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 0', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a96e', fontFamily: 'Georgia,serif' }}>Est. with love</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Object.entries(USERS).map(([key, u]) => (
              <button key={key} onClick={() => setActiveUser(key)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: activeUser === key ? u.color : 'rgba(255,255,255,0.1)', border: activeUser === key ? `2px solid ${u.color}` : '1px solid rgba(255,255,255,0.15)', color: activeUser === key ? '#1a0a2e' : u.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Georgia,serif' }}
                title={`Switch to ${u.label}`}>
                {u.label[0]}
              </button>
            ))}
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>
              {USERS[activeUser].label}'s view
            </span>
          </div>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', padding: '28px 24px 20px', position: 'relative', zIndex: 2 }}>
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" style={{ marginBottom: 10 }}>
            <ellipse cx="27" cy="10" rx="19" ry="7.5" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <ellipse cx="27" cy="44" rx="19" ry="7.5" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <rect x="8" y="10" width="38" height="34" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <ellipse cx="27" cy="27" rx="11" ry="5" stroke="#c9a96e" strokeWidth="1" fill="none"/>
            <path d="M 20,22 Q 27,18 34,22 Q 27,32 20,28 Z" stroke="#c9a96e" strokeWidth="1" fill="rgba(201,169,110,0.1)"/>
          </svg>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 40, fontWeight: 400, color: '#f5ece0', letterSpacing: '0.05em', lineHeight: 1, marginBottom: 6 }}>
            Threads <em style={{ color: '#c9a96e' }}>of Joy</em>
          </h1>
          <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg,transparent,#c9a96e,transparent)', margin: '10px auto' }} />
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9070a0', marginBottom: 3 }}>Machine Quilting Stencils & Tools</p>
          <p style={{ fontSize: 12, color: '#a89070', fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>Continuous line · Competition grade · Made with love</p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            {Object.entries(USERS).map(([key, u]) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '6px 16px', color: '#e8d5b7', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Georgia,serif' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: u.color }} />
                {u.label}'s Studio
              </div>
            ))}
          </div>
        </div>

        {/* Partner strip */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 24px 14px', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          {SOURCES.map(s => (
            <span key={s} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 11px', fontSize: 10, color: '#a080c0', letterSpacing: '0.08em' }}>{s}</span>
          ))}
        </div>
      </header>

      {/* ══════════════════════════════════════════ NAV */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', padding: '0 16px', overflowX: 'auto', position: 'sticky', top: 0, zIndex: 10 }}>
        {[
          { id: 'design', label: 'Design Studio' },
          { id: 'catalog', label: 'Catalog' },
          { id: 'favorites', label: `Favorites (${favorites.length})` },
          { id: 'upload', label: 'Photo Assist' },
          { id: 'preview', label: 'Preview & Export' },
        ].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            style={{ padding: '12px 18px', border: 'none', background: 'transparent', fontSize: 13, color: tab === n.id ? '#7c3aed' : '#6b7280', borderBottom: tab === n.id ? '2px solid #7c3aed' : '2px solid transparent', fontWeight: tab === n.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Georgia,serif', transition: 'all 0.15s' }}>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ══════════════════════════════════════════ CONTENT */}
      <main style={{ maxWidth: 920, margin: '0 auto', padding: '22px 16px 60px' }}>

        {/* ── DESIGN STUDIO ──────────────────────────── */}
        {tab === 'design' && (
          <div className="fade-in">
            <div className="info-banner">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#9333ea" strokeWidth="1.5"><circle cx="7" cy="7" r="6"/><line x1="7" y1="5" x2="7" y2="7.5"/><circle cx="7" cy="9.5" r="0.6" fill="#9333ea"/></svg>
              All designs are continuous-line · Line weight is always 1/8" regardless of stencil size
            </div>

            {/* Layout */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Quilting Layout</div>
              <div className="grid-2" style={{ marginBottom: 12 }}>
                <div>
                  <label className="field-label">Layout Type</label>
                  <div className="toggle-group">
                    {['edge','border','block'].map(l => (
                      <button key={l} className={`toggle-btn${layout === l ? ' active' : ''}`} onClick={() => setLayout(l)}>
                        {l === 'edge' ? 'Edge to Edge' : l === 'border' ? 'Border' : 'Block'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label">Output Format</label>
                  <div className="toggle-group">
                    {['svg','pdf'].map(f => (
                      <button key={f} className={`toggle-btn${fmt === f ? ' active' : ''}`} onClick={() => setFmt(f)}>
                        {f.toUpperCase()} File
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {layout === 'border' && (
                <div className="fade-in">
                  <div className="divider" />
                  <div className="grid-3">
                    <div><label className="field-label">Border Length (in)</label><input type="number" value={borderLen} onChange={e => setBorderLen(+e.target.value)} min="1" max="300" step="0.25"/></div>
                    <div><label className="field-label">Border Width (in)</label><input type="number" value={borderWidth} onChange={e => setBorderWidth(+e.target.value)} min="1" max="24" step="0.25"/></div>
                    <div>
                      <label className="field-label">Corner Treatment</label>
                      <select value={cornerTreat} onChange={e => setCornerTreat(e.target.value)}>
                        <option value="none">No corner</option>
                        <option value="matching">Matching corner</option>
                        <option value="separate">Separate corner design</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {layout === 'block' && (
                <div className="fade-in">
                  <div className="divider" />
                  <div className="grid-2">
                    <div>
                      <label className="field-label">Block Pattern</label>
                      <select value={blockType} onChange={e => setBlockType(e.target.value)}>
                        {Object.entries(BLOCKS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div><label className="field-label">Block Size (in)</label><input type="number" defaultValue={12} min="3" max="24" step="0.5"/></div>
                  </div>
                </div>
              )}
            </div>

            {/* Stencil Type */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Stencil Type</div>
              <div className="grid-2">
                {[
                  { key: 'plastic', title: 'Plastic / Mylar Stencil', desc: 'Bridges auto-placed every 3/4" to hold the plastic together. Cut on Cricut or laser. Classic chalk-pounce method.', note: 'Bridge 1/16" wide · 0.75" spacing', noteColor: '#7c3aed', noteBg: '#ede9fe' },
                  { key: 'silk', title: 'Silk Screen Stencil', desc: 'Open mesh — no bridges needed. Apply chalk paste through screen. Perfectly continuous lines.', note: 'No bridges · full continuous line', noteColor: '#0f766e', noteBg: '#e0f2f1' },
                ].map(s => (
                  <div key={s.key} onClick={() => setStencilType(s.key)} style={{ border: stencilType === s.key ? '2px solid #9333ea' : '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', background: stencilType === s.key ? '#faf5ff' : '#fff', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: stencilType === s.key ? '#6b21a8' : '#111', marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 }}>{s.desc}</div>
                    <span style={{ fontSize: 10, color: s.noteColor, background: s.noteBg, padding: '3px 8px', borderRadius: 6 }}>{s.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Stencil Size</div>
              <div className="grid-2">
                <div>
                  <label className="field-label">Width — max 11.75"</label>
                  <div className="range-row">
                    <input type="range" min="2" max="11.75" step="0.25" value={sW} onChange={e => setSW(+e.target.value)} />
                    <span className="range-val">{sW.toFixed(2)}"</span>
                  </div>
                </div>
                <div>
                  <label className="field-label">Height — max 23.75"</label>
                  <div className="range-row">
                    <input type="range" min="2" max="23.75" step="0.25" value={sH} onChange={e => setSH(+e.target.value)} />
                    <span className="range-val">{sH.toFixed(2)}"</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#9333ea', background: '#f3e8ff', padding: '6px 12px', borderRadius: 6 }}>
                Stencil: <strong>{sW.toFixed(2)}" × {sH.toFixed(2)}"</strong> · Line weight: <strong>1/8" fixed at all sizes</strong>
              </div>
            </div>

            {/* Motif */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Design Motif</div>
              <div className="flex wrap gap-2">
                {MOTIFS.map(m => (
                  <button key={m} className={`chip${motifs.includes(m) ? ' active' : ''}`} onClick={() => toggleMotif(m)}>{m}</button>
                ))}
              </div>
              <div className="mt-3">
                <label className="field-label">Custom Keywords</label>
                <input type="text" value={customMotif} onChange={e => setCustomMotif(e.target.value)} placeholder="e.g. hummingbirds, sunflowers, Celtic knots, art deco…" />
              </div>
            </div>

            {/* Source */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Design Source</div>
              <div className="flex wrap gap-2">
                {SOURCES.map(s => (
                  <button key={s} className={`chip${sources.includes(s) ? ' active' : ''}`} onClick={() => toggleSource(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="flex wrap gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : 'Generate Stencil'}
              </button>
              <button className="btn btn-secondary" onClick={() => setTab('catalog')}>Browse Catalog</button>
              <button className="btn btn-secondary" onClick={() => setTab('upload')}>Upload Quilt Photo</button>
            </div>
          </div>
        )}

        {/* ── CATALOG ──────────────────────────── */}
        {tab === 'catalog' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={catStyle} onChange={e => setCatStyle(e.target.value)} style={{ maxWidth: 160 }}>
                <option value="">All Styles</option>
                {['feather','floral','geometric','modern','traditional','western'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select value={catLayout} onChange={e => setCatLayout(e.target.value)} style={{ maxWidth: 160 }}>
                <option value="">All Layouts</option>
                {['edge','border','block'].map(l => <option key={l} value={l}>{l === 'edge' ? 'Edge to Edge' : l.charAt(0).toUpperCase()+l.slice(1)}</option>)}
              </select>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{filteredCatalog.length} designs</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 12 }}>
              {filteredCatalog.map(item => (
                <div key={item.id} className="fav-card" onClick={() => loadFromCatalog(item)} style={{ cursor: 'pointer' }}>
                  <div style={{ height: 115, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}
                    dangerouslySetInnerHTML={{ __html: thumbnailSVG(item.style) }} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 5 }}>{item.source}</div>
                    {item.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAVORITES ──────────────────────────── */}
        {tab === 'favorites' && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 400, fontFamily: 'Georgia,serif', color: '#1a0a2e' }}>Shared Favorites</h2>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Everyone sees all saved designs — Julie, Mom, and Kim share this space</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchFavorites} disabled={favLoading}>
                {favLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {favorites.length === 0 && !favLoading && (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧵</div>
                <p style={{ color: '#6b7280', fontSize: 13 }}>No favorites saved yet. Generate a stencil design and save it here to share with everyone!</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('design')}>Go to Design Studio</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
              {favorites.map(fav => {
                const u = USERS[fav.user] || USERS.julie
                const d = fav.design
                return (
                  <div key={fav.id} className="fav-card">
                    {/* User badge */}
                    <div style={{ padding: '8px 12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="user-badge" style={{ background: u.bg, color: u.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.color, display: 'inline-block' }} />
                        {u.label}
                      </span>
                      <span style={{ fontSize: 10, color: '#d1d5db' }}>
                        {new Date(fav.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Mini preview */}
                    <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', margin: '8px 12px 0', borderRadius: 6, overflow: 'hidden' }}
                      dangerouslySetInnerHTML={{ __html: thumbnailSVG(d.motifs?.[0] || 'traditional') }} />

                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 3 }}>
                        {d.layout === 'edge' ? 'Edge to Edge' : d.layout === 'border' ? 'Border' : `Block — ${BLOCKS[d.blockType] || 'Custom'}`}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 5 }}>
                        {d.sW?.toFixed(1)}" × {d.sH?.toFixed(1)}" · {d.stencil === 'plastic' ? 'Mylar' : 'Silk Screen'}
                      </div>
                      {(d.motifs || []).map(m => <span key={m} className="tag">{m}</span>)}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => loadFromFavorite(fav)}>Load Design</button>
                        <button className="btn-icon" onClick={() => handleDeleteFavorite(fav.id)} title="Remove favorite">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="2" y1="2" x2="11" y2="11"/><line x1="11" y1="2" x2="2" y2="11"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PHOTO ASSIST ──────────────────────────── */}
        {tab === 'upload' && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Upload Your Quilt</div>
              <label style={{ cursor: 'pointer' }}>
                <div className="upload-zone">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="#9333ea" strokeWidth="1.5" style={{ marginBottom: 10, opacity: 0.6 }}>
                    <rect x="3" y="3" width="30" height="30" rx="4"/><path d="M12 18 L18 12 L24 18"/><line x1="18" y1="12" x2="18" y2="26"/>
                  </svg>
                  <p>Drop or click to upload a photo of your quilt top, design, or pattern</p>
                  <small style={{ color: '#9ca3af', fontSize: 11, marginTop: 4, display: 'block' }}>JPG · PNG · PDF — AI analyzes piecing and suggests complementary quilting designs</small>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} style={{ display: 'none' }} />
              </label>
              {uploadedImg && (
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <img src={uploadedImg} alt="Uploaded quilt" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Analyzing your quilt's design, color values, and density…</p>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="card fade-in">
                <div className="section-label">Suggested Quilting Designs</div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Based on your quilt's piecing, color value, and density — these designs will complement it beautifully:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 9 }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => setSelectedSuggestion(i)}
                      style={{ border: selectedSuggestion === i ? '2px solid #9333ea' : '1px solid #e5e7eb', borderRadius: 8, padding: '11px 13px', cursor: 'pointer', background: selectedSuggestion === i ? '#f3e8ff' : '#fff', transition: 'all 0.12s' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selectedSuggestion === i ? '#6b21a8' : '#111', marginBottom: 3 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.4, marginBottom: 6 }}>{s.sub}</div>
                      <span className="tag">{s.motif}</span>
                      <span className="tag">{s.layout}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 wrap">
                  <button className="btn btn-primary" onClick={handleGenerateFromSuggestion} disabled={selectedSuggestion === null}>Generate Selected Stencil</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PREVIEW & EXPORT ──────────────────────────── */}
        {tab === 'preview' && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="section-label">Stencil Preview</div>
              {generatedSVG ? (
                <>
                  <div className="stencil-preview-box" style={{ maxHeight: 340, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                    <div style={{ transform: `scale(${Math.min(1, 460 / (sW * 96), 330 / (sH * 96))})`, transformOrigin: 'top center', width: Math.round(sW * 96), height: Math.round(sH * 96) }}
                      dangerouslySetInnerHTML={{ __html: generatedSVG }} />
                  </div>
                  <div style={{ marginTop: 14, background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '14px 16px' }}>
                    <table className="result-table">
                      <tbody>
                        {designParams && <>
                          <tr><td>Layout</td><td>{designParams.layout === 'edge' ? 'Edge to Edge' : designParams.layout === 'border' ? 'Border' : `Block — ${BLOCKS[designParams.blockType] || ''}`}</td></tr>
                          <tr><td>Stencil Type</td><td>{designParams.stencil === 'plastic' ? 'Plastic / Mylar (bridges included)' : 'Silk Screen (bridgeless)'}</td></tr>
                          <tr><td>Size</td><td>{sW.toFixed(2)}" × {sH.toFixed(2)}"</td></tr>
                          <tr><td>Line Weight</td><td>1/8" (fixed)</td></tr>
                          <tr><td>Motifs</td><td>{(designParams.motifs || []).join(', ') || 'Custom'}</td></tr>
                          <tr><td>Saved by</td><td style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: USERS[activeUser].color, display: 'inline-block' }} />{USERS[activeUser].label}</td></tr>
                        </>}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 mt-4 wrap">
                    <button className="btn btn-primary" onClick={handleDownload}>⬇ Download SVG</button>
                    <button className="btn btn-secondary" onClick={handleSaveFavorite} disabled={savingFav} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {savingFav ? 'Saving…' : <>♥ Save to Favorites</>}
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setTab('design') }}>Edit Design</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#d8b4fe" strokeWidth="1.5" style={{ marginBottom: 14 }}>
                    <path d="M8 24 Q18 8 28 24 Q38 40 48 24" strokeLinecap="round"/><path d="M0 30 Q10 14 20 30 Q30 46 40 30" strokeLinecap="round" opacity="0.4"/>
                  </svg>
                  <p style={{ fontSize: 13 }}>Generate a stencil design first to preview it here</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('design')}>Go to Design Studio</button>
                </div>
              )}
            </div>

            {generatedSVG && designParams && (
              <div className="card fade-in">
                <div className="section-label">Quilter's Notes</div>
                <p className="notes-p">
                  {designParams.stencil === 'plastic'
                    ? <>
                        <strong>Plastic / Mylar stencil</strong> — Cut on 7mil Mylar in Cricut Design Space (set reference lines and labels to No Cut; only the stencil path cuts). Bridges are included automatically every 3/4" — they're just 1/16" wide so the chalk mark is barely interrupted. Lay stencil on your pressed quilt top, secure edges with painter's tape, and pounce chalk powder through the channels using a pounce pad — dab, don't rub. Lift straight up. Allow chalk to rest 30 seconds.<br /><br />
                        <strong>Stitching</strong> — Follow the chalk line in one continuous pass. Simply stitch through each bridge gap — the chalk on either side guides your needle. Never needs to start and stop.
                      </>
                    : <>
                        <strong>Silk screen stencil</strong> — No bridges needed. The open mesh supports the full continuous line perfectly. Lay the screen flat on your pressed quilt top, secure with painter's tape, apply chalk paste through the mesh with a squeegee or pounce pad using light even pressure. Lift straight up. Rinse screen with cold water after use.<br /><br />
                        <strong>Stitching</strong> — Follow the chalk line in one continuous pass. This is a true full-line design — your needle never needs to stop and restart.
                      </>
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ background: '#1a0a2e', padding: '24px', textAlign: 'center', marginTop: 40 }}>
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 14, color: '#c9a96e', fontStyle: 'italic', marginBottom: 6 }}>Threads of Joy</p>
        <p style={{ fontSize: 11, color: '#6b4f8a', letterSpacing: '0.1em' }}>Made with love for Julie, Mom, and Kim · Competition grade · Continuous line · 1/8" always</p>
      </footer>
    </>
  )
}
