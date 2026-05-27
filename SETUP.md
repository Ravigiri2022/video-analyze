# Vilyze — Local Setup Guide

## What you need

- macOS with Homebrew
- asdf (already installed)
- Docker Desktop (for Supabase local)
- An OpenAI API key

---

## Step 1 — Install Docker Desktop

Supabase runs locally inside Docker.

1. Download from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify: `docker --version`

---

## Step 2 — Start Supabase locally

```bash
cd /Users/macbookair/project/video-analize

# Start local Supabase (first run downloads ~500MB of Docker images)
supabase start
```

This starts:
- Postgres on port 54322
- Supabase API on port 54321
- Supabase Studio (dashboard) on port 54323
- Inbucket (email) on port 54324

After it starts, you'll see output like:

```
API URL: http://127.0.0.1:54321
anon key: eyJ...
service_role key: eyJ...
```

**Copy those keys** — you need them in the next step.

To run migrations (creates tables):
```bash
supabase db reset
```

---

## Step 3 — Set up Supabase Auth (Google/GitHub OAuth)

For **local dev**, you can use email magic links instead of OAuth:

In Supabase Studio (http://localhost:54323):
1. Go to Authentication → Providers
2. Email is enabled by default — works for local testing

For OAuth (Google/GitHub), add redirect URL in each provider config:
`http://localhost:3000/auth/callback`

---

## Step 4 — Set up the Next.js frontend

```bash
cd apps/web

# Copy env file
cp .env.local.example .env.local
```

Edit `.env.local` and fill in values from `supabase start` output:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...        ← anon key from supabase start
SUPABASE_SERVICE_ROLE_KEY=eyJ...            ← service_role key from supabase start
```

Install Node.js deps (asdf will use Node 20.19.0 from .tool-versions):
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```

Open http://localhost:3000 — you should see the landing page.

---

## Step 5 — Set up the Python worker

```bash
cd apps/worker

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies (this takes ~5 minutes first time — downloads Whisper model weights)
pip install -r requirements.txt

# Copy env file
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=eyJ...    ← same service_role key as above
OPENAI_API_KEY=sk-...               ← your OpenAI API key
```

Start the worker:
```bash
uvicorn main:app --reload --port 8001
```

The worker will:
1. Start polling the jobs table every 5 seconds
2. When a job appears, download the video, run the full AI pipeline, save results

---

## Step 6 — Test it end-to-end

1. Open http://localhost:3000
2. Click "Get started free" → you'll be redirected to login
3. Sign in (use email magic link for local testing)
4. Click "Upload Video"
5. Upload the test video: `videos/TRY_NOT_TO_LAUGH_African_Edition_2_720P.mp4`
6. Watch the worker terminal — you'll see the pipeline running
7. When done, you'll be redirected to the analysis results page

---

## Useful commands

```bash
# See Supabase status
supabase status

# Stop Supabase (preserves data)
supabase stop

# Reset database (drops all data, re-runs migrations)
supabase db reset

# Open Supabase Studio in browser
open http://localhost:54323

# Check worker logs
# (look at the terminal where you ran uvicorn)

# Run Next.js in production mode
cd apps/web && npm run build && npm start

# Check ffmpeg is installed (needed by worker)
ffmpeg -version
```

---

## Install ffmpeg (if not already installed)

```bash
brew install ffmpeg
```

---

## Project structure

```
video-analize/
├── apps/
│   ├── web/          ← Next.js 16 frontend (port 3000)
│   └── worker/       ← Python FastAPI AI worker (port 8001)
├── supabase/
│   └── migrations/   ← SQL schema (runs via `supabase db reset`)
├── .tool-versions    ← asdf: Node 20.19.0, Python 3.12.2
└── SETUP.md          ← this file
```

---

## Troubleshooting

**`supabase start` fails**
→ Make sure Docker Desktop is running

**Worker can't connect to Supabase**
→ Check `supabase status` — make sure it's running
→ Verify `SUPABASE_URL=http://127.0.0.1:54321` (not https)

**Whisper out of memory**
→ Use `WHISPER_MODEL=tiny` in `.env` (faster, less accurate)

**ffmpeg not found**
→ `brew install ffmpeg`

**`supabase db reset` migration fails**
→ Check `supabase/migrations/` — all 3 files should exist
→ Run `supabase logs db` to see the error

**YouTube download fails**
→ yt-dlp is included in requirements.txt
→ Make sure the URL is a valid public YouTube video
→ Some videos are geo-restricted and can't be downloaded

---

## Cost when you deploy

| Service | Cost | Notes |
|---|---|---|
| Vercel | $0 | Frontend |
| Supabase | $0 | Free tier (500MB DB, 1GB storage) |
| Fly.io | $5/mo | Python worker |
| OpenAI | $2-4/mo | GPT-4o-mini per analysis |
| **Total** | **~$7-9/mo** | |
