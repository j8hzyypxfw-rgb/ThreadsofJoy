// pages/api/favorites.js
// Shared favorites store using Vercel Blob
// All three users (Julie, Mom, Kim) share one favorites list — everyone sees everyone's saves

import { put, list, del } from '@vercel/blob'

const BLOB_KEY = 'threads-of-joy/favorites.json'

async function readFavorites() {
  try {
    const { blobs } = await list({ prefix: 'threads-of-joy/favorites' })
    if (!blobs || blobs.length === 0) return []
    // Get the most recent blob
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    const resp = await fetch(sorted[0].url)
    if (!resp.ok) return []
    return await resp.json()
  } catch {
    return []
  }
}

async function writeFavorites(favorites) {
  const json = JSON.stringify(favorites, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  await put(BLOB_KEY, blob, { access: 'public', addRandomSuffix: false })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const favorites = await readFavorites()
    return res.status(200).json({ favorites })
  }

  if (req.method === 'POST') {
    const { user, design } = req.body
    if (!user || !design) return res.status(400).json({ error: 'user and design required' })

    const favorites = await readFavorites()
    const id = `fav_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newFav = {
      id,
      user,
      design,
      savedAt: new Date().toISOString(),
    }
    favorites.unshift(newFav) // newest first

    // Keep max 200 favorites
    if (favorites.length > 200) favorites.splice(200)

    await writeFavorites(favorites)
    return res.status(200).json({ success: true, favorite: newFav })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id required' })

    const favorites = await readFavorites()
    const filtered = favorites.filter(f => f.id !== id)
    await writeFavorites(filtered)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
