// pages/api/favorites.js
// Shared favorites using Vercel Blob (private store)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN not configured', favorites: [] })
  }

  let blobModule
  try {
    blobModule = await import('@vercel/blob')
  } catch (e) {
    return res.status(500).json({ error: '@vercel/blob not installed. Run: npm install @vercel/blob', favorites: [] })
  }

  const { put, list, head, del } = blobModule
  const BLOB_NAME = 'toj-favorites.json'

  // Read favorites — fetch via signed URL since store is private
  async function readFavorites() {
    try {
      const { blobs } = await list({ prefix: 'toj-favorites', token: process.env.BLOB_READ_WRITE_TOKEN })
      if (!blobs || blobs.length === 0) return []
      // Use the Vercel Blob download endpoint with the token (works for private stores)
      const blob = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
      const response = await fetch(blob.downloadUrl || blob.url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      })
      if (!response.ok) return []
      return await response.json()
    } catch (e) {
      console.error('readFavorites:', e.message)
      return []
    }
  }

  // Write favorites — use 'public' if possible, fall back to no access param
  async function writeFavorites(favorites) {
    const content = JSON.stringify(favorites, null, 2)
    // Try without specifying access — lets Vercel use the store's default
    await put(BLOB_NAME, content, {
      contentType: 'application/json',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    })
  }

  // ── GET ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const favorites = await readFavorites()
      return res.status(200).json({ favorites })
    } catch (e) {
      console.error('GET favorites:', e.message)
      return res.status(200).json({ favorites: [], error: e.message })
    }
  }

  // ── POST ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { user, design } = req.body || {}
      if (!user || !design) return res.status(400).json({ error: 'user and design required' })
      const favorites = await readFavorites()
      const newFav = {
        id: `fav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user,
        design,
        savedAt: new Date().toISOString(),
      }
      favorites.unshift(newFav)
      if (favorites.length > 200) favorites.splice(200)
      await writeFavorites(favorites)
      return res.status(200).json({ success: true, favorite: newFav })
    } catch (e) {
      console.error('POST favorites:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  // ── DELETE ───────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const favorites = await readFavorites()
      await writeFavorites(favorites.filter(f => f.id !== id))
      return res.status(200).json({ success: true })
    } catch (e) {
      console.error('DELETE favorites:', e.message)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
