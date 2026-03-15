// pages/api/favorites.js
// Shared favorites using Vercel Blob
// Julie, Mom, and Kim all share one favorites list

import { put, list } from '@vercel/blob'

async function readFavorites() {
  try {
    const { blobs } = await list({ prefix: 'toj-favorites' })
    if (!blobs || blobs.length === 0) return []
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    const res = await fetch(sorted[0].url)
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

async function writeFavorites(favorites) {
  const blob = new Blob([JSON.stringify(favorites)], { type: 'application/json' })
  await put('toj-favorites.json', blob, { access: 'public', addRandomSuffix: false })
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
    const { user, design } = req.body || {}
    if (!user || !design) return res.status(400).json({ error: 'user and design required' })
    const favorites = await readFavorites()
    const newFav = { id: `fav_${Date.now()}`, user, design, savedAt: new Date().toISOString() }
    favorites.unshift(newFav)
    if (favorites.length > 200) favorites.splice(200)
    await writeFavorites(favorites)
    return res.status(200).json({ success: true, favorite: newFav })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id required' })
    const favorites = await readFavorites()
    await writeFavorites(favorites.filter(f => f.id !== id))
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
