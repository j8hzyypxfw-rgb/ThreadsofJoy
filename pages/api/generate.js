// pages/api/generate.js
import { generateSVG } from '../../lib/stencil'

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const svg = generateSVG(req.body)
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Content-Disposition', 'inline; filename="threads-of-joy-stencil.svg"')
    return res.status(200).send(svg)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
