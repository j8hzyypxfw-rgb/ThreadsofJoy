import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { MOTIFS, SOURCES, BLOCKS, CATALOG, USERS, generateSVG, thumbnailSVG } from '../lib/stencil'

const SUGGESTIONS = [
  { title: 'Feather Plume Edge-to-Edge', sub: 'Flowing feathers complement geometric piecing', motif: 'Feathers', layout: 'edge' },
  { title: 'Dense Baptist Fan', sub: 'Classic allover creates rich texture contrast', motif: 'Baptist Fan', layout: 'edge' },
  { title: 'Feather Wreath on Blocks', sub: 'Medallion wreath anchors each block', motif: 'Feathers', layout: 'block' },
  { title: 'Organic Stipple', sub: 'Dense stipple makes star points pop forward', motif: 'Stipple', layout: 'edge' },
  { title: 'Floral Vine Border', sub: 'Flowing vines frame the quilt with romance', motif: 'Floral', layout: 'border' },
  { title: 'Geometric Crosshatch', sub: 'Precise grid adds depth to solid areas', motif: 'Geometric', layout: 'edge' },
]

const COMPLEXITY_LABELS = ['', 'Simple', 'Moderate', 'Complex', 'Heirloom']
const COMPLEXITY_DESC = [
  '',
  'Clean lines, open spacing. Beginner-friendly, quick to stitch.',
  'Flowing curves with moderate detail. Great for most quilts.',
  'Rich detail with echo lines and intricate barbs. Show quality.',
  'Maximum detail — competition and heirloom level.',
]

export default function Home() {
  // ── Tab & user ─────────────────────────────────────────────────
  const [tab, setTab] = useState('design')
  const [activeUser, setActiveUser] = useState('julie')

  // ── Design options ──────────────────────────────────────────────
  const [layout, setLayout] = useState('edge')
  const [fmt, setFmt] = useState('svg')
  const [stencilType, setStencilType] = useState('plastic')
  const [motifs, setMotifs] = useState(['Feathers'])
  const [sources, setSources] = useState([])
  const [sW, setSW] = useState(11.75)
  const [sH, setSH] = useState(11.75)
  const [borderWidth, setBorderWidth] = useState(6)
  const [cornerTreat, setCornerTreat] = useState('none')
  const [blockType, setBlockType] = useState('ohio')
  const [customMotif, setCustomMotif] = useState('')

  // ── New features ────────────────────────────────────────────────
  const [complexity, setComplexity] = useState(2)
  const [machine, setMachine] = useState('longarm')
  const [minGap, setMinGap] = useState(0.5)
  const [maxGap, setMaxGap] = useState(1.0)
  const [variableDensity, setVariableDensity] = useState(false)

  // ── Generation ──────────────────────────────────────────────────
  const [generatedSVG, setGeneratedSVG] = useState('')
  const [generating, setGenerating] = useState(false)
  const [designParams, setDesignParams] = useState(null)

  // ── Favorites ───────────────────────────────────────────────────
  const [favorites, setFavorites] = useState([])
  const [favLoading, setFavLoading] = useState(false)
  const [savingFav, setSavingFav] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  // ── Catalog / upload ────────────────────────────────────────────
  const [catStyle, setCatStyle] = useState('')
  const [catLayout, setCatLayout] = useState('')
  const [uploadedImg, setUploadedImg] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)

  const previewRef = useRef(null)

  useEffect(() => { fetchFavorites() }, [])

  // Rebuild preview whenever design params change
  useEffect(() => {
    if (generatedSVG && previewRef.current) {
      previewRef.current.innerHTML = generatedSVG
    }
  }, [generatedSVG])

  const fetchFavorites = async () => {
    setFavLoading(true)
    try {
      const r = await fetch('/api/favorites')
      const d = await r.json()
      setFavorites(d.favorites || [])
    } catch { setFavorites([]) }
    setFavLoading(false)
  }

  const toggleMotif = (m) => setMotifs(prev =>
    prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
  )
  const toggleSource = (s) => setSources(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  )

  const buildParams = () => ({
    layout,
    motifs: motifs.length ? motifs : (customMotif ? [customMotif] : ['Feathers']),
    stencil: stencilType,
    sW, sH, borderWidth, blockType,
    complexity, machine, minGap,
    maxGap: variableDensity ? maxGap : minGap,
    variableDensity,
  })

  const handleGenerate = () => {
    setGenerating(true)
    try {
      const params = buildParams()
      setDesignParams(params)
      const svg = generateSVG(params)
      setGeneratedSVG(svg)
      setTab('preview')
    } catch (e) {
      alert('Error generating stencil: ' + e.message)
    }
    setGenerating(false)
  }

  const handleSaveFavorite = async () => {
    if (!generatedSVG || !designParams) return
    setSavingFav(true)
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: activeUser, design: designParams }),
      })
      await fetchFavorites()
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
    } catch (e) { console.error(e) }
    setSavingFav(false)
  }

  const handleDeleteFav = async (id) => {
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
      reader.onload = ev => { setUploadedImg(ev.target.result); setSuggestions(SUGGESTIONS) }
      reader.readAsDataURL(f)
    } else {
      setUploadedImg(null); setSuggestions(SUGGESTIONS)
    }
  }

  const handleGenerateFromSuggestion = () => {
    if (selectedSuggestion === null) return
    const s = SUGGESTIONS[selectedSuggestion]
    setMotifs([s.motif])
    setLayout(s.layout)
    setTimeout(handleGenerate, 50)
  }

  const loadFromCatalog = (item) => {
    setLayout(item.layout)
    setMotifs([item.style.charAt(0).toUpperCase() + item.style.slice(1)])
    setSources([item.source])
    setTab('design')
  }

  const loadFromFavorite = (fav) => {
    const d = fav.design
    if (d.layout) setLayout(d.layout)
    if (d.motifs) setMotifs(d.motifs)
    if (d.stencil) setStencilType(d.stencil)
    if (d.sW) setSW(d.sW)
    if (d.sH) setSH(d.sH)
    if (d.blockType) setBlockType(d.blockType)
    if (d.complexity) setComplexity(d.complexity)
    if (d.machine) setMachine(d.machine)
    if (d.minGap) setMinGap(d.minGap)
    if (d.maxGap) setMaxGap(d.maxGap)
    if (d.variableDensity !== undefined) setVariableDensity(d.variableDensity)
    setTab('design')
  }

  const filteredCatalog = CATALOG.filter(d =>
    (!catStyle || d.style === catStyle) && (!catLayout || d.layout === catLayout)
  )

  // ── Styles ─────────────────────────────────────────────────────
  const S = {
    card: { background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:'18px 20px', marginBottom:14 },
    sectionLabel: { fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#9ca3af', paddingBottom:8, borderBottom:'1px solid #f3f4f6', marginBottom:14, display:'block' },
    fieldLabel: { fontSize:11, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', color:'#6b7280', marginBottom:5, display:'block' },
    toggleGroup: { display:'flex', border:'1px solid #e5e7eb', borderRadius:6, overflow:'hidden' },
    toggleBtn: (active) => ({ flex:1, padding:'9px 6px', border:'none', background: active ? '#f3e8ff' : 'transparent', color: active ? '#6b21a8' : '#6b7280', fontWeight: active ? 600 : 400, cursor:'pointer', fontSize:12, fontFamily:'Georgia,serif', transition:'all 0.12s', lineHeight:1.3 }),
    btnPrimary: { background:'#7c3aed', color:'#fff', border:'none', padding:'10px 22px', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Georgia,serif', transition:'all 0.15s' },
    btnSec: { background:'#f9fafb', color:'#374151', border:'1px solid #e5e7eb', padding:'10px 18px', borderRadius:6, fontSize:13, cursor:'pointer', fontFamily:'Georgia,serif', transition:'all 0.15s' },
    btnSm: { padding:'6px 14px', fontSize:12, borderRadius:6, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', color:'#374151', fontFamily:'Georgia,serif' },
    chip: (active) => ({ padding:'5px 12px', borderRadius:20, border: active ? '1px solid #9333ea' : '1px solid #e5e7eb', background: active ? '#f3e8ff' : '#f9fafb', fontSize:12, cursor:'pointer', color: active ? '#6b21a8' : '#6b7280', fontWeight: active ? 600 : 400, transition:'all 0.12s', fontFamily:'Georgia,serif', marginBottom:4 }),
    stencilCard: (active) => ({ border: active ? '2px solid #9333ea' : '1px solid #e5e7eb', borderRadius:10, padding:'14px 16px', cursor:'pointer', background: active ? '#faf5ff' : '#fff', transition:'all 0.15s', flex:1 }),
    row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
    row3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
    infoBanner: { background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:6, padding:'9px 13px', fontSize:12, color:'#7c3aed', marginBottom:14, display:'flex', alignItems:'center', gap:8 },
    rangeRow: { display:'flex', alignItems:'center', gap:10 },
    rangeVal: { fontSize:13, fontWeight:700, color:'#111', minWidth:52, textAlign:'right' },
    tag: { display:'inline-block', padding:'2px 7px', borderRadius:10, fontSize:10, background:'#f3e8ff', color:'#7c3aed', marginRight:3, marginTop:2 },
  }

  const navTabs = [
    { id:'design',   label:'Design Studio' },
    { id:'catalog',  label:'Catalog' },
    { id:'favorites',label:`Favorites (${favorites.length})` },
    { id:'upload',   label:'Photo Assist' },
    { id:'preview',  label:'Preview & Export' },
  ]

  return (
    <>
      <Head>
        <title>Threads of Joy — Quilting Stencils & Tools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <header style={{ background:'#1a0a2e', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 15% 60%, rgba(180,100,220,0.18) 0%,transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(201,169,110,0.12) 0%,transparent 50%)' }} />

        {/* User switcher */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 24px 0', position:'relative', zIndex:2 }}>
          <span style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#c9a96e', fontFamily:'Georgia,serif' }}>Est. with love</span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {Object.entries(USERS).map(([key, u]) => (
              <button key={key} onClick={() => setActiveUser(key)} style={{ width:34, height:34, borderRadius:'50%', background: activeUser===key ? u.color : 'rgba(255,255,255,0.1)', border: activeUser===key ? `2px solid ${u.color}` : '1px solid rgba(255,255,255,0.15)', color: activeUser===key ? '#1a0a2e' : u.color, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:'Georgia,serif' }}>{u.label[0]}</button>
            ))}
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginLeft:2 }}>{USERS[activeUser].label}&apos;s view</span>
          </div>
        </div>

        {/* Logo */}
        <div style={{ textAlign:'center', padding:'26px 24px 18px', position:'relative', zIndex:2 }}>
          <svg width="52" height="52" viewBox="0 0 54 54" fill="none" style={{ marginBottom:10 }}>
            <ellipse cx="27" cy="10" rx="19" ry="7.5" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <ellipse cx="27" cy="44" rx="19" ry="7.5" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <rect x="8" y="10" width="38" height="34" stroke="#c9a96e" strokeWidth="1.5" fill="none"/>
            <ellipse cx="27" cy="27" rx="11" ry="5" stroke="#c9a96e" strokeWidth="1" fill="none"/>
            <path d="M 20,22 Q 27,18 34,22 Q 27,32 20,28 Z" stroke="#c9a96e" strokeWidth="1" fill="rgba(201,169,110,0.1)"/>
          </svg>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:40, fontWeight:400, color:'#f5ece0', letterSpacing:'0.05em', lineHeight:1, marginBottom:6 }}>
            Threads <em style={{ color:'#c9a96e' }}>of Joy</em>
          </h1>
          <div style={{ width:200, height:1, background:'linear-gradient(90deg,transparent,#c9a96e,transparent)', margin:'10px auto' }} />
          <p style={{ fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase', color:'#9070a0', marginBottom:3 }}>Machine Quilting Stencils & Tools</p>
          <p style={{ fontSize:12, color:'#a89070', fontFamily:'Georgia,serif', fontStyle:'italic' }}>Continuous line · Competition grade · Made with love</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:16, flexWrap:'wrap' }}>
            {Object.entries(USERS).map(([key,u]) => (
              <div key={key} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:'6px 16px', color:'#e8d5b7', fontSize:12, display:'flex', alignItems:'center', gap:7, fontFamily:'Georgia,serif' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:u.color }} />{u.label}&apos;s Studio
              </div>
            ))}
          </div>
        </div>

        {/* Partner strip */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'8px 24px 14px', display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', position:'relative', zIndex:2 }}>
          {SOURCES.map(s => <span key={s} style={{ background:'rgba(255,255,255,0.05)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'3px 11px', fontSize:10, color:'#a080c0', letterSpacing:'0.08em' }}>{s}</span>)}
        </div>
      </header>

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', display:'flex', padding:'0 16px', overflowX:'auto', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        {navTabs.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ padding:'12px 18px', border:'none', background:'transparent', fontSize:13, color: tab===n.id ? '#7c3aed' : '#6b7280', borderBottom: tab===n.id ? '2px solid #7c3aed' : '2px solid transparent', fontWeight: tab===n.id ? 700 : 400, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Georgia,serif', transition:'all 0.15s' }}>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <main style={{ maxWidth:920, margin:'0 auto', padding:'22px 16px 60px' }}>

        {/* ── DESIGN STUDIO ─────────────────────────────────────── */}
        {tab === 'design' && (
          <div>
            <div style={S.infoBanner}>
              ℹ️ All designs are continuous-line · Line weight is always 1/8" regardless of size
            </div>

            {/* Layout */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Quilting Layout</span>
              <div style={{ ...S.row2, marginBottom:12 }}>
                <div>
                  <label style={S.fieldLabel}>Layout Type</label>
                  <div style={S.toggleGroup}>
                    {[['edge','Edge to Edge'],['border','Border'],['block','Block']].map(([v,l]) => (
                      <button key={v} style={S.toggleBtn(layout===v)} onClick={() => setLayout(v)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={S.fieldLabel}>Output Format</label>
                  <div style={S.toggleGroup}>
                    {[['svg','SVG File'],['pdf','PDF File']].map(([v,l]) => (
                      <button key={v} style={S.toggleBtn(fmt===v)} onClick={() => setFmt(v)}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {layout === 'border' && (
                <div>
                  <div style={{ height:1, background:'#f3f4f6', margin:'12px 0' }} />
                  <div style={S.row3}>
                    <div><label style={S.fieldLabel}>Border Length (in)</label><input type="number" defaultValue={60} min="1" max="300" step="0.25" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}/></div>
                    <div><label style={S.fieldLabel}>Border Width (in)</label><input type="number" value={borderWidth} onChange={e=>setBorderWidth(+e.target.value)} min="1" max="24" step="0.25" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}/></div>
                    <div>
                      <label style={S.fieldLabel}>Corner Treatment</label>
                      <select value={cornerTreat} onChange={e=>setCornerTreat(e.target.value)} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}>
                        <option value="none">No corner</option>
                        <option value="matching">Matching corner</option>
                        <option value="separate">Separate corner design</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {layout === 'block' && (
                <div>
                  <div style={{ height:1, background:'#f3f4f6', margin:'12px 0' }} />
                  <div style={S.row2}>
                    <div>
                      <label style={S.fieldLabel}>Block Pattern</label>
                      <select value={blockType} onChange={e=>setBlockType(e.target.value)} style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}>
                        {Object.entries(BLOCKS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div><label style={S.fieldLabel}>Block Size (in)</label><input type="number" defaultValue={12} min="3" max="24" step="0.5" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}/></div>
                  </div>
                </div>
              )}
            </div>

            {/* Stencil Type */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Stencil Type</span>
              <div style={{ display:'flex', gap:12 }}>
                {[
                  { key:'plastic', title:'Plastic / Mylar Stencil', desc:'Bridges auto-placed every 3/4" to hold plastic together. Cut on Cricut or laser. Classic chalk-pounce.', note:'Bridge 1/16" · 0.75" spacing', nc:'#7c3aed', nb:'#ede9fe' },
                  { key:'silk',    title:'Silk Screen Stencil',      desc:'Open mesh, no bridges. Apply chalk paste through screen. Perfectly continuous, no interruptions.',        note:'No bridges · full continuous', nc:'#0f766e', nb:'#e0f2f1' },
                ].map(opt => (
                  <div key={opt.key} style={S.stencilCard(stencilType===opt.key)} onClick={() => setStencilType(opt.key)}>
                    <div style={{ fontSize:13, fontWeight:700, color: stencilType===opt.key ? '#6b21a8' : '#111', marginBottom:4 }}>{opt.title}</div>
                    <div style={{ fontSize:11, color:'#6b7280', lineHeight:1.5, marginBottom:8 }}>{opt.desc}</div>
                    <span style={{ fontSize:10, color:opt.nc, background:opt.nb, padding:'3px 8px', borderRadius:6 }}>{opt.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Machine Type */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Machine Type</span>
              <div style={S.row2}>
                <div>
                  <label style={S.fieldLabel}>Optimize For</label>
                  <div style={S.toggleGroup}>
                    {[['longarm','Longarm Quilting Machine'],['domestic','Domestic Sewing Machine']].map(([v,l]) => (
                      <button key={v} style={S.toggleBtn(machine===v)} onClick={() => setMachine(v)}>{l}</button>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>
                    {machine === 'longarm' ? 'Tighter turns, finer curves, closer spacing. Full longarm range.' : 'Wider spacing and gentler curves for domestic machine maneuverability.'}
                  </div>
                </div>
                <div>
                  <label style={S.fieldLabel}>Design Complexity</label>
                  <div style={S.toggleGroup}>
                    {[1,2,3,4].map(v => (
                      <button key={v} style={S.toggleBtn(complexity===v)} onClick={() => setComplexity(v)}>{COMPLEXITY_LABELS[v]}</button>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>{COMPLEXITY_DESC[complexity]}</div>
                </div>
              </div>
            </div>

            {/* Density */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Stitch Density (Gap Between Lines)</span>
              <div style={{ marginBottom:10, display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="varDensity" checked={variableDensity} onChange={e=>setVariableDensity(e.target.checked)} style={{ width:15, height:15, accentColor:'#7c3aed' }}/>
                <label htmlFor="varDensity" style={{ fontSize:13, color:'#374151', cursor:'pointer' }}>Variable density (alternates between min and max for texture)</label>
              </div>

              <div style={S.row2}>
                <div>
                  <label style={S.fieldLabel}>{variableDensity ? 'Minimum Gap (densest)' : 'Gap Between Lines'}</label>
                  <div style={S.rangeRow}>
                    <input type="range" min="0.25" max="3" step="0.25" value={minGap} onChange={e=>setMinGap(+e.target.value)} style={{ flex:1, accentColor:'#7c3aed' }}/>
                    <span style={S.rangeVal}>{minGap}"</span>
                  </div>
                  <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>
                    {minGap <= 0.25 ? 'Micro-stipple — very dense, stiff hand' : minGap <= 0.5 ? 'Dense — great for thin batting, show quilts' : minGap <= 1 ? 'Moderate — most batting types' : minGap <= 2 ? 'Open — soft drape, thick batting' : 'Very open — decorative, loose drape'}
                  </div>
                </div>

                {variableDensity && (
                  <div>
                    <label style={S.fieldLabel}>Maximum Gap (most open)</label>
                    <div style={S.rangeRow}>
                      <input type="range" min="0.25" max="3" step="0.25" value={maxGap} onChange={e=>setMaxGap(Math.max(+e.target.value, minGap))} style={{ flex:1, accentColor:'#7c3aed' }}/>
                      <span style={S.rangeVal}>{maxGap}"</span>
                    </div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>Creates visual texture — dense areas recede, open areas come forward</div>
                  </div>
                )}
              </div>

              {/* Batting guide */}
              <div style={{ marginTop:12, background:'#faf5ff', borderRadius:6, padding:'10px 14px', fontSize:12, color:'#6b7280' }}>
                <strong style={{ color:'#7c3aed' }}>Batting density guide:</strong> Cotton: 0.5"–1" · Wool: 0.75"–2" · Polyester: 0.5"–1.5" · Bamboo: 0.5"–1.25" · Warm & Natural: 0.5"–1"
              </div>
            </div>

            {/* Size */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Stencil Size</span>
              <div style={S.row2}>
                <div>
                  <label style={S.fieldLabel}>Width — max 11.75"</label>
                  <div style={S.rangeRow}>
                    <input type="range" min="2" max="11.75" step="0.25" value={sW} onChange={e=>setSW(+e.target.value)} style={{ flex:1, accentColor:'#7c3aed' }}/>
                    <span style={S.rangeVal}>{sW.toFixed(2)}"</span>
                  </div>
                </div>
                <div>
                  <label style={S.fieldLabel}>Height — max 23.75"</label>
                  <div style={S.rangeRow}>
                    <input type="range" min="2" max="23.75" step="0.25" value={sH} onChange={e=>setSH(+e.target.value)} style={{ flex:1, accentColor:'#7c3aed' }}/>
                    <span style={S.rangeVal}>{sH.toFixed(2)}"</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10, textAlign:'center', fontSize:12, color:'#9333ea', background:'#f3e8ff', padding:'6px', borderRadius:6 }}>
                {sW.toFixed(2)}" × {sH.toFixed(2)}" &nbsp;·&nbsp; Line weight: <strong>1/8" fixed</strong>
              </div>
            </div>

            {/* Motif */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Design Motif</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {MOTIFS.map(m => (
                  <button key={m} style={S.chip(motifs.includes(m))} onClick={() => toggleMotif(m)}>{m}</button>
                ))}
              </div>
              <div style={{ marginTop:10 }}>
                <label style={S.fieldLabel}>Custom Keywords</label>
                <input value={customMotif} onChange={e=>setCustomMotif(e.target.value)} placeholder="e.g. hummingbirds, sunflowers, Celtic knots…" style={{ width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}/>
              </div>
            </div>

            {/* Source */}
            <div style={S.card}>
              <span style={S.sectionLabel}>Design Source</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {SOURCES.map(s => (
                  <button key={s} style={S.chip(sources.includes(s))} onClick={() => toggleSource(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button style={S.btnPrimary} onClick={handleGenerate} disabled={generating}>
                {generating ? 'Generating…' : '✦ Generate Stencil'}
              </button>
              <button style={S.btnSec} onClick={() => setTab('catalog')}>Browse Catalog</button>
              <button style={S.btnSec} onClick={() => setTab('upload')}>Upload Quilt Photo</button>
            </div>
          </div>
        )}

        {/* ── CATALOG ───────────────────────────────────────────── */}
        {tab === 'catalog' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
              <select value={catStyle} onChange={e=>setCatStyle(e.target.value)} style={{ padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}>
                <option value="">All Styles</option>
                {['feather','floral','geometric','modern','traditional','western'].map(s=><option key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select value={catLayout} onChange={e=>setCatLayout(e.target.value)} style={{ padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6, fontSize:13, fontFamily:'Georgia,serif' }}>
                <option value="">All Layouts</option>
                <option value="edge">Edge to Edge</option>
                <option value="border">Border</option>
                <option value="block">Block</option>
              </select>
              <span style={{ fontSize:12, color:'#9ca3af' }}>{filteredCatalog.length} designs</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))', gap:12 }}>
              {filteredCatalog.map(item => (
                <div key={item.id} onClick={() => loadFromCatalog(item)} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='#9333ea'; e.currentTarget.style.transform='translateY(-2px)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.transform='translateY(0)' }}>
                  <div style={{ height:115, display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb' }} dangerouslySetInnerHTML={{ __html: thumbnailSVG(item.style) }}/>
                  <div style={{ padding:'10px 12px' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:2 }}>{item.name}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginBottom:5 }}>{item.source}</div>
                    {item.tags.map(t=><span key={t} style={S.tag}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAVORITES ─────────────────────────────────────────── */}
        {tab === 'favorites' && (
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:400, fontFamily:'Georgia,serif', color:'#1a0a2e' }}>Shared Favorites</h2>
                <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>Julie, Mom, and Kim all share this space — everyone sees everyone&apos;s saves</p>
              </div>
              <button style={S.btnSm} onClick={fetchFavorites} disabled={favLoading}>{favLoading ? 'Loading…' : 'Refresh'}</button>
            </div>

            {favorites.length === 0 && !favLoading && (
              <div style={{ ...S.card, textAlign:'center', padding:40 }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🧵</div>
                <p style={{ color:'#6b7280', fontSize:13 }}>No favorites yet. Generate a design and save it to share with everyone!</p>
                <button style={{ ...S.btnPrimary, marginTop:16 }} onClick={() => setTab('design')}>Go to Design Studio</button>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14 }}>
              {favorites.map(fav => {
                const u = USERS[fav.user] || USERS.julie
                const d = fav.design || {}
                return (
                  <div key={fav.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ padding:'8px 12px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:600, background:u.bg, color:u.color }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:u.color, display:'inline-block' }}/>{u.label}
                      </span>
                      <span style={{ fontSize:10, color:'#d1d5db' }}>{new Date(fav.savedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                    </div>
                    <div style={{ height:95, display:'flex', alignItems:'center', justifyContent:'center', background:'#f9fafb', margin:'8px 12px 0', borderRadius:6 }}
                      dangerouslySetInnerHTML={{ __html: thumbnailSVG((d.motifs?.[0]||'feathers').toLowerCase()) }}/>
                    <div style={{ padding:'10px 12px' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:2 }}>
                        {d.layout==='edge'?'Edge to Edge':d.layout==='border'?'Border':`Block — ${BLOCKS[d.blockType]||'Custom'}`}
                      </div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>
                        {(d.sW||0).toFixed(1)}" × {(d.sH||0).toFixed(1)}" · {d.stencil==='plastic'?'Mylar':'Silk'}
                      </div>
                      {d.complexity && <div style={{ fontSize:11, color:'#9ca3af', marginBottom:5 }}>Complexity: {COMPLEXITY_LABELS[d.complexity]} · {d.machine==='longarm'?'Longarm':'Domestic'}</div>}
                      {(d.motifs||[]).map(m=><span key={m} style={S.tag}>{m}</span>)}
                      <div style={{ display:'flex', gap:6, marginTop:10 }}>
                        <button style={{ ...S.btnSm, flex:1 }} onClick={() => loadFromFavorite(fav)}>Load Design</button>
                        <button onClick={() => handleDeleteFav(fav.id)} style={{ padding:'6px 10px', border:'1px solid #fecaca', background:'#fff', borderRadius:6, cursor:'pointer', fontSize:12, color:'#ef4444' }}>✕</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PHOTO ASSIST ──────────────────────────────────────── */}
        {tab === 'upload' && (
          <div>
            <div style={S.card}>
              <span style={S.sectionLabel}>Upload Your Quilt</span>
              <label style={{ cursor:'pointer' }}>
                <div style={{ border:'2px dashed #e5e7eb', borderRadius:10, padding:'36px 24px', textAlign:'center', background:'#f9fafb', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='#9333ea'; e.currentTarget.style.background='#faf5ff' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.background='#f9fafb' }}>
                  <div style={{ fontSize:32, marginBottom:10, color:'#9333ea', opacity:0.5 }}>↑</div>
                  <p style={{ fontSize:13, color:'#6b7280', marginBottom:4 }}>Drop or click to upload a photo of your quilt top, design, or pattern</p>
                  <small style={{ fontSize:11, color:'#9ca3af' }}>JPG · PNG · PDF — suggests complementary quilting designs</small>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={handleUpload} style={{ display:'none' }}/>
              </label>
              {uploadedImg && (
                <div style={{ marginTop:14, textAlign:'center' }}>
                  <img src={uploadedImg} alt="Uploaded quilt" style={{ maxWidth:'100%', maxHeight:240, borderRadius:8, border:'1px solid #e5e7eb' }}/>
                  <p style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>Analyzing your quilt&apos;s design, color values, and density…</p>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div style={S.card}>
                <span style={S.sectionLabel}>Suggested Quilting Designs</span>
                <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>Based on your quilt&apos;s piecing, color value, and density:</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:9 }}>
                  {suggestions.map((s,i) => (
                    <div key={i} onClick={() => setSelectedSuggestion(i)} style={{ border: selectedSuggestion===i ? '2px solid #9333ea' : '1px solid #e5e7eb', borderRadius:8, padding:'11px 13px', cursor:'pointer', background: selectedSuggestion===i ? '#f3e8ff' : '#fff', transition:'all 0.12s' }}>
                      <div style={{ fontSize:12, fontWeight:700, color: selectedSuggestion===i ? '#6b21a8' : '#111', marginBottom:3 }}>{s.title}</div>
                      <div style={{ fontSize:11, color:'#9ca3af', lineHeight:1.4, marginBottom:5 }}>{s.sub}</div>
                      <span style={S.tag}>{s.motif}</span>
                      <span style={S.tag}>{s.layout}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10, marginTop:14 }}>
                  <button style={S.btnPrimary} onClick={handleGenerateFromSuggestion} disabled={selectedSuggestion===null}>Generate Selected Stencil</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PREVIEW & EXPORT ──────────────────────────────────── */}
        {tab === 'preview' && (
          <div>
            <div style={S.card}>
              <span style={S.sectionLabel}>Stencil Preview</span>
              {generatedSVG ? (
                <>
                  {/* Live SVG preview rendered directly — no dangerouslySetInnerHTML sizing issues */}
                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:8 }}>
                    <div style={{ maxWidth:'100%', overflow:'auto' }} dangerouslySetInnerHTML={{ __html: generatedSVG.replace(
                      /width="(\d+)" height="(\d+)"/,
                      (_, w, h) => {
                        const scale = Math.min(1, 840 / +w, 500 / +h)
                        return `width="${Math.round(+w*scale)}" height="${Math.round(+h*scale)}" viewBox="0 0 ${w} ${h}"`
                      }
                    )}}/>
                  </div>

                  {/* Design summary */}
                  {designParams && (
                    <div style={{ marginTop:14, background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:8, padding:'14px 16px' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <tbody>
                          {[
                            ['Layout', designParams.layout==='edge'?'Edge to Edge':designParams.layout==='border'?'Border':`Block — ${BLOCKS[designParams.blockType]||''}`],
                            ['Stencil', designParams.stencil==='plastic'?'Plastic / Mylar (bridges included)':'Silk Screen (bridgeless)'],
                            ['Machine', designParams.machine==='longarm'?'Longarm quilting machine':'Domestic sewing machine'],
                            ['Complexity', COMPLEXITY_LABELS[designParams.complexity]],
                            ['Density', designParams.variableDensity ? `Variable ${designParams.minGap}"–${designParams.maxGap}"` : `${designParams.minGap}" between lines`],
                            ['Size', `${designParams.sW.toFixed(2)}" × ${designParams.sH.toFixed(2)}"`],
                            ['Line weight', '1/8" (fixed)'],
                            ['Motifs', (designParams.motifs||[]).join(', ')||'Custom'],
                            ['Saved by', USERS[activeUser].label],
                          ].map(([k,v]) => (
                            <tr key={k} style={{ borderBottom:'1px solid #f3e8ff' }}>
                              <td style={{ padding:'6px 0', fontSize:11, color:'#9333ea', textTransform:'uppercase', letterSpacing:'0.06em', width:'38%' }}>{k}</td>
                              <td style={{ padding:'6px 0', fontSize:13, color:'#111' }}>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:10, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
                    <button style={S.btnPrimary} onClick={handleDownload}>⬇ Download SVG</button>
                    <button style={{ ...S.btnSec, color: savedMsg ? '#059669' : '#374151' }} onClick={handleSaveFavorite} disabled={savingFav}>
                      {savedMsg ? '✓ Saved!' : savingFav ? 'Saving…' : '♥ Save to Favorites'}
                    </button>
                    <button style={S.btnSec} onClick={() => setTab('design')}>Edit Design</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign:'center', padding:'48px 24px', color:'#9ca3af' }}>
                  <div style={{ fontSize:40, marginBottom:14, opacity:0.3 }}>✦</div>
                  <p style={{ fontSize:13 }}>Generate a stencil design first to preview it here</p>
                  <button style={{ ...S.btnPrimary, marginTop:16 }} onClick={() => setTab('design')}>Go to Design Studio</button>
                </div>
              )}
            </div>

            {generatedSVG && designParams && (
              <div style={S.card}>
                <span style={S.sectionLabel}>Quilter&apos;s Notes</span>
                <p style={{ fontSize:13, color:'#374151', lineHeight:1.8 }}>
                  {designParams.stencil === 'plastic'
                    ? <><strong>Plastic / Mylar stencil</strong> — Cut on 7mil Mylar in Cricut Design Space. Bridges (1/16" wide, every 3/4") hold the stencil together. Lay on your pressed quilt top, tape edges, pounce chalk through channels. Lift straight up. Stitch through bridge gaps — the chalk guides you. Full continuous line, never needs to stop.</>
                    : <><strong>Silk screen stencil</strong> — Open mesh, no bridges. Lay flat on pressed quilt top, apply chalk paste with a squeegee or pounce pad. Lift straight up. Rinse screen with cold water after use. Fully continuous line.</>
                  }
                  {designParams.machine === 'domestic' && <><br/><br/><strong>Domestic machine tip</strong> — Use a free-motion foot and drop your feed dogs. Stitch at a consistent speed to keep stitch length even. The wider spacing in this design is optimized for easier domestic machine movement.</>}
                  {designParams.variableDensity && <><br/><br/><strong>Variable density</strong> — The design alternates between {designParams.minGap}" and {designParams.maxGap}" gaps. Stitch the denser sections first while your hands and machine are fresh. The open sections create a sense of depth and movement.</>}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ background:'#1a0a2e', padding:'24px', textAlign:'center' }}>
        <p style={{ fontFamily:'Georgia,serif', fontSize:14, color:'#c9a96e', fontStyle:'italic', marginBottom:6 }}>Threads of Joy</p>
        <p style={{ fontSize:11, color:'#6b4f8a', letterSpacing:'0.1em' }}>Made with love for Julie, Mom, and Kim · Competition grade · Continuous line · 1/8" always</p>
      </footer>
    </>
  )
}
