// pages/api/favorites.js
// Shared favorites — Vercel Blob with graceful error handling

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Check token exists upfront — give a clear error if not
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      error: 'BLOB_READ_WRITE_TOKEN not set. Go to Vercel → Storage → Create Blob → Connect to project → Redeploy.',
      blobMissing: true,
    })
  }

  // Lazy import so missing package doesn't crash the whole build
  let putBlob, listBlobs
  try {
    const blobModule = await import('@vercel/blob')
    putBlob = blobModule.put
    listBlobs = blobModule.list
  } catch (e) {
    return res.status(500).json({ error: '@vercel/blob package not found. Run: npm install @vercel/blob', packageMissing: true })
  }

  async function readFavorites() {
    try {
      const { blobs } = await listBlobs({ prefix: 'toj-favorites' })
      if (!blobs || blobs.length === 0) return []
      const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      const response = await fetch(sorted[0].url)
      if (!response.ok) return []
      return await response.json()
    } catch (e) {
      console.error('readFavorites error:', e)
      return []
    }
  }

  async function writeFavorites(favorites) {
    const content = JSON.stringify(favorites, null, 2)
    await putBlob('toj-favorites.json', content, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })
  }

  if (req.method === 'GET') {
    try {
      const favorites = await readFavorites()
      return res.status(200).json({ favorites })
    } catch (e) {
      console.error('GET error:', e)
      return res.status(500).json({ error: e.message, favorites: [] })
    }
  }

  if (req.method === 'POST') {
    try {
      const { user, design } = req.body || {}
      if (!user || !design) return res.status(400).json({ error: 'user and design required' })
      const favorites = await readFavorites()
      const newFav = {
        id: `fav_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        user,
        design,
        savedAt: new Date().toISOString(),
      }
      favorites.unshift(newFav)
      if (favorites.length > 200) favorites.splice(200)
      await writeFavorites(favorites)
      return res.status(200).json({ success: true, favorite: newFav })
    } catch (e) {
      console.error('POST error:', e)
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const favorites = await readFavorites()
      await writeFavorites(favorites.filter(f => f.id !== id))
      return res.status(200).json({ success: true })
    } catch (e) {
      console.error('DELETE error:', e)
      return res.status(500).json({ error: e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
