# SchooliAT — Railway + Vercel Deployment Guide

This guide deploys:
- **Backend API** → Railway (free $5/month credit)
- **Dashboard (Next.js)** → Vercel (free tier)
- **PostgreSQL Database** → Railway (free, bundled with backend)

---

## Prerequisites

- GitHub account with this repo pushed
- Railway account → https://railway.app (sign up with GitHub)
- Vercel account → https://vercel.com (sign up with GitHub)

---

## PART 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to **https://railway.app** → log in with GitHub
2. Click **"New Project"** → select **"Deploy from GitHub Repo"**
3. Select your repo: `schooliatProject-main`
4. Railway will detect the `Backend/Dockerfile` and `railway.toml`

### Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates a PostgreSQL instance automatically
3. Click on the PostgreSQL service → go to **"Variables"** tab → copy the `DATABASE_URL`

### Step 3: Set Environment Variables

Go to your backend service → **"Variables"** tab → **"Raw Editor"** → paste:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_RAILWAY_HOST:5432/railway
JWT_SECRET=generate-a-long-random-string-here-use-https-randomkeygen-com
JWT_EXPIRATION_TIME=48
ALLOWED_ORIGINS=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
FILE_STORAGE=local
FILE_SIZE_LIMIT=10
FILE_PATH=files
LOG_LEVEL=info
PUPPETEER_POOL_SIZE=1
```

**IMPORTANT:** Replace these values:
- `YOUR_PASSWORD` → from the PostgreSQL service variables
- `YOUR_RAILWAY_HOST` → from PostgreSQL variables (looks like `roundhouse.proxy.rlwy.net`)
- `your-app.vercel.app` → your actual Vercel URL (you'll get this after Part 2)

### Step 4: Set Root Directory

1. Go to backend service → **"Settings"** tab
2. Under **"Build"** → set **"Root Directory"** to `Backend`
3. Click **"Deploy"**

### Step 5: Wait for First Deploy

- Build takes ~3-5 minutes (downloading Chromium for Puppeteer)
- On every start, `docker-entrypoint.sh` runs `prisma db push` automatically to sync schema
- Once deployed, Railway gives you a URL like: `https://your-backend.up.railway.app`
- Test it: visit `https://your-backend.up.railway.app/health`
- You should see: `{"status":"healthy"}`

---

## PART 2: Deploy Dashboard to Vercel

### Step 6: Import Repository

1. Go to **https://vercel.com** → log in with GitHub
2. Click **"Add New Project"** → **"Import"**
3. Select your repo: `schooliatProject-main`

### Step 7: Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: click "Edit" → set to `dashboard`
3. **Build Command**: `npm run build` (default)
4. **Install Command**: `npm install` (default)

### Step 8: Set Environment Variables

Click **"Environment Variables"** → add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | *(leave EMPTY)* |
| `BACKEND_URL` | `https://your-backend.up.railway.app` |

**Why NEXT_PUBLIC_API_URL is empty:**
- Empty = dashboard makes requests to its own domain (`/api/v1/...`)
- Next.js rewrites proxy those requests server-side to Railway
- No CORS issues, no exposed backend URL

### Step 9: Deploy

Click **"Deploy"** → wait ~2 minutes.

Vercel gives you a URL like: `https://schooliat.vercel.app`

### Step 10: Update Backend CORS

Go back to **Railway** → backend service → **Variables** → update:

```env
ALLOWED_ORIGINS=https://schooliat.vercel.app
FRONTEND_URL=https://schooliat.vercel.app
```

Redeploy the backend.

---

## PART 3: Verify Everything Works

### Test Login

1. Visit `https://your-app.vercel.app`
2. Use credentials:
   - **Super Admin**: `admin@schooliat.com` / `Admin@123`
   - **School Admin**: `admin@gis001.edu` / `Admin@123`
   - **x-platform**: `web` (sent automatically)

### Check API Connection

Open browser DevTools → Network tab → login → verify:
- Requests go to `https://your-app.vercel.app/auth/authenticate`
- Response returns a token (not 401/403/500)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Railway | Check logs — usually Prisma generate needs schema path |
| `JWT_SECRET must be set` | Add JWT_SECRET to Railway env vars |
| `Puppeteer error` | Ensure Dockerfile installs Chromium (already included) |
| CORS error on login | Update `ALLOWED_ORIGINS` in Railway to include Vercel URL |
| Dashboard shows "Network error" | Check `BACKEND_URL` is set correctly in Vercel |
| `prisma db push` fails | Ensure DATABASE_URL points to Railway PostgreSQL, not local |
| 404 on all pages | Ensure Vercel root directory is set to `dashboard` |

---

## File Reference

| File | Purpose |
|------|---------|
| `Backend/Dockerfile` | Railway build — installs Node 20, Chromium, Prisma |
| `Backend/railway.toml` | Railway deploy config — health check, restart policy |
| `Backend/docker-entrypoint.sh` | Runs `prisma db push` on every start, then boots server |
| `Backend/package.json` | `postinstall` runs `prisma generate` automatically |
| `dashboard/next.config.js` | Rewrites `/api/*` → `BACKEND_URL` (server-side proxy) |
| `dashboard/lib/api/config.ts` | `BASE_URL` = `NEXT_PUBLIC_API_URL` (empty = same-origin) |

---

## Cost Estimate

| Service | Free Tier | Paid (if exceeded) |
|---------|-----------|-------------------|
| Railway PostgreSQL | 500MB, 100 hours/month | $1-5/month |
| Railway Backend | $5 credit/month | ~$5/month for small app |
| Vercel Dashboard | 100GB bandwidth, unlimited deploys | $20/month Pro |
| **Total** | **$0** | **~$5-10/month** |
