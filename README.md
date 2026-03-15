# Threads of Joy 🧵
**Machine Quilting Stencils & Tools — For Julie, Mom, and Kim**

## Deploy to Vercel (5 minutes)

### Step 1 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2 — Create a free Vercel account
Go to https://vercel.com and sign up (free tier is plenty).

### Step 3 — Set up Vercel Blob storage (for shared favorites)
1. Go to your Vercel dashboard → Storage tab
2. Click "Create Database" → choose "Blob"
3. Name it `threads-of-joy-blob`
4. Copy the `BLOB_READ_WRITE_TOKEN` it gives you

### Step 4 — Deploy
```bash
cd threads-of-joy
npm install
vercel deploy --prod
```

When prompted:
- Link to existing project? **No** → create new
- Project name: **threads-of-joy**
- Which directory? **.** (current)

### Step 5 — Add the Blob token
After deploy, go to Vercel dashboard → your project → Settings → Environment Variables:
```
BLOB_READ_WRITE_TOKEN = paste your token here
```
Then redeploy:
```bash
vercel deploy --prod
```

### That's it! 🎉
Your site will be live at `https://threads-of-joy.vercel.app`

---

## Features
- **Design Studio** — Generate continuous-line stencils (edge-to-edge, border, block)
- **Catalog** — 20+ pre-designed stencils filterable by style and layout
- **Shared Favorites** — Julie, Mom, and Kim all save and see each other's favorites
- **Photo Assist** — Upload a quilt photo for AI design suggestions
- **Preview & Export** — Download SVG (Cricut-ready) or PDF
- **Stencil types** — Plastic/Mylar (with bridges) or Silk Screen (bridgeless)
- **Fixed 1/8" line weight** at any size up to 11.75" × 23.75"

## Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

For local favorites to work, create a `.env.local` file:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```
