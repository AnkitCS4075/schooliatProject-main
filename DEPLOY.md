# SchooliAT — Render + Vercel Deployment Guide (FREE)

This guide deploys:
- **Backend API** → Render (free tier)
- **Dashboard (Next.js)** → Vercel (free tier)
- **PostgreSQL Database** → Render (free tier, bundled)

---

## Prerequisites

- GitHub account with this repo pushed
- Render account → https://render.com (sign up with GitHub, no credit card needed)
- Vercel account → https://vercel.com (sign up with GitHub)

---

## PART 1: Deploy Backend to Render

### Step 1: Create PostgreSQL Database

1. Go to **https://render.com** → sign up with GitHub
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - **Name**: `schooliat-db`
   - **Database**: `schooliat`
   - **User**: `schooliat`
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait ~2 minutes for it to be ready
6. Go to **"Connection"** tab → copy the **"Internal Database URL"**
   - It looks like: `postgresql://schooliat:abc123@dpg-xxxxx.oregon-postgres.render.com/schooliat`

### Step 2: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo: `schooliatProject-main`
3. Settings:
   - **Name**: `schooliat-api`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Dockerfile Path**: `Backend/Dockerfile`
   - **Plan**: Free
4. Scroll to **"Environment Variables"** → click **"Add Environment Variable"** → add:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://schooliat:abc123@dpg-xxxxx.oregon-postgres.render.com/schooliat
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

**Replace:**
- `DATABASE_URL` → paste the Internal Database URL from Step 1
- `your-app.vercel.app` → your actual Vercel URL (get this after Part 2)
- `JWT_SECRET` → generate at https://randomkeygen.com

5. Click **"Create Web Service"**

### Step 3: Wait for First Deploy

- Build takes ~5-8 minutes (downloading Chromium for Puppeteer)
- On every start, `docker-entrypoint.sh` runs `prisma db push` automatically
- Once deployed, Render gives you a URL like: `https://schooliat-api.onrender.com`
- Test it: visit `https://schooliat-api.onrender.com/health`
- You should see: `{"status":"healthy"}`

**Note:** Free tier services spin down after 15 minutes of inactivity. First request after idle takes ~30-50 seconds to wake up. Subsequent requests are fast.

---

## PART 2: Deploy Dashboard to Vercel

### Step 4: Import Repository

1. Go to **https://vercel.com** → log in with GitHub
2. Click **"Add New Project"** → **"Import"**
3. Select your repo: `schooliatProject-main`

### Step 5: Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: click "Edit" → set to `dashboard`
3. **Build Command**: `npm run build` (default)
4. **Install Command**: `npm install` (default)

### Step 6: Set Environment Variables

Click **"Environment Variables"** → add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | *(leave EMPTY)* |
| `BACKEND_URL` | `https://schooliat-api.onrender.com` |

**Why NEXT_PUBLIC_API_URL is empty:**
- Empty = dashboard makes requests to its own domain (`/api/v1/...`)
- Next.js rewrites proxy those requests server-side to Render
- No CORS issues, no exposed backend URL

### Step 7: Deploy

Click **"Deploy"** → wait ~2 minutes.

Vercel gives you a URL like: `https://schooliat.vercel.app`

### Step 8: Update Backend CORS

Go back to **Render** → backend service → **Environment** → edit variables:

```env
ALLOWED_ORIGINS=https://schooliat.vercel.app
FRONTEND_URL=https://schooliat.vercel.app
```

Click **"Save"** → Render auto-redeploys.

---

## PART 3: Verify Everything Works

### Test Login

1. Visit `https://your-app.vercel.app`
2. Use credentials:
   - **Super Admin**: `admin@schooliat.com` / `Admin@123`
   - **School Admin**: `admin@gis001.edu` / `Admin@123`
   - **x-platform**: `web` (sent automatically)

## just checking
### Check API Connection

Open browser DevTools → Network tab → login → verify:
- Requests go to `https://your-app.vercel.app/auth/authenticate`
- Response returns a token (not 401/403/500)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Render | Check deploy logs — usually Prisma generate needs schema path |
| `JWT_SECRET must be set` | Add JWT_SECRET to Render env vars |
| `Puppeteer error` | Ensure Dockerfile installs Chromium (already included) |
| CORS error on login | Update `ALLOWED_ORIGINS` in Render to include Vercel URL |
| Dashboard shows "Network error" | Check `BACKEND_URL` is set correctly in Vercel |
| `prisma db push` fails | Ensure DATABASE_URL points to Render PostgreSQL (Internal URL, not External) |
| 404 on all pages | Ensure Vercel root directory is set to `dashboard` |
| Service sleeps after idle | Normal for free tier — first request takes ~30-50 sec to wake |
| `Connection refused` | Database might not be ready — check Render dashboard database status |

---

## File Reference

| File | Purpose |
|------|---------|
| `Backend/Dockerfile` | Docker build — Node 20 + Chromium + Prisma |
| `Backend/docker-entrypoint.sh` | Runs `prisma db push` on every start, then boots server |
| `Backend/package.json` | `postinstall` runs `prisma generate` automatically |
| `dashboard/next.config.js` | Rewrites `/api/*` → `BACKEND_URL` (server-side proxy) |
| `dashboard/lib/api/config.ts` | `BASE_URL` = `NEXT_PUBLIC_API_URL` (empty = same-origin) |

---

## Cost Estimate

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Render PostgreSQL | 90 days free, then $7/month | 90-day free trial included |
| Render Web Service | Free (spins down after 15 min) | ~30-50 sec wake-up time |
| Vercel Dashboard | 100GB bandwidth, unlimited deploys | Always-on |
| **Total** | **$0 for 90 days** | Then ~$7/month for database |

---

## Alternative: Free Database Beyond 90 Days

If Render's database trial expires, use **Neon** (free PostgreSQL):
1. Go to https://neon.tech → sign up → create project
2. Copy the connection string
3. Update `DATABASE_URL` in Render with Neon's URL (append `?sslmode=require`)
4. Redeploy

Neon free tier: 512MB storage, always available, no expiration.
